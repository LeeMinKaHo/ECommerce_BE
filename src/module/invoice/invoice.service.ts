import { Inject, Service } from 'typedi';
import { CartService } from '../cart/cart.service';
import { PayPalService } from '../paypal/paypal.service';
import { Pagination } from '../shared/http/pagination.dto';
import { Error } from '../shared/errors/error-custom';
import { UserService } from '../user/user.service';
import invoiceModel, { InvoiceStatus } from './model/invoice.model';
import { InvoiceRequest, InvoiceRequestItem } from './model/invoice.type';
import { ProductService } from '../product/product.service';
import { BuyNowDTO } from './dto/buy-now.dto';
import { InvoiceFilterDTO } from './dto/filter.dto';
import { logger } from '../shared/middleware/logger';
import productModel from '../product/model/product.model';
import { Types } from 'mongoose';

@Service()
export class InvoiceService {
  constructor(
    @Inject() private paypalService: PayPalService,
    @Inject() private cartService: CartService,
    @Inject() private userService: UserService,
    @Inject() private productService: ProductService
  ) { }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private buildInvoiceItems(items: InvoiceRequestItem[]) {
    return items.map((item) => ({
      ...item,
      total: item.price * item.quantity,
    }));
  }

  /** Tái sử dụng result từ buildInvoiceItems thay vì tính lại price*quantity */
  private calculateTotal(builtItems: ReturnType<typeof this.buildInvoiceItems>) {
    return builtItems.reduce((sum, item) => sum + item.total, 0);
  }

  /**
   * ✅ FIX #5 — Kiểm tra tồn kho trước khi checkout
   * Throw OutOfStock nếu bất kỳ item nào không đủ hàng
   */
  private async validateStock(items: InvoiceRequestItem[]) {
    for (const item of items) {
      const product = await productModel.findOne(
        {
          _id: new Types.ObjectId(item.productId),
          'colorVariants.sizes._id': new Types.ObjectId(item.variantId),
          isDeleted: false,
        },
        { 'colorVariants.$': 1 }
      );

      if (!product || !product.colorVariants?.length) {
        throw Error.ProductNotFound;
      }

      const sizeEntry = product.colorVariants[0].sizes.find(
        (s) => s._id?.toString() === item.variantId
      );

      if (!sizeEntry || sizeEntry.quantity < item.quantity) {
        logger.warn('[Invoice] Stock check failed', {
          productId: item.productId,
          variantId: item.variantId,
          requested: item.quantity,
          available: sizeEntry?.quantity ?? 0,
        });
        throw Error.OutOfStock;
      }
    }
  }

  // ─── Core ─────────────────────────────────────────────────────────────────────

  async createInvoice(req: InvoiceRequest) {
    const items = this.buildInvoiceItems(req.items);
    const totalPrice = this.calculateTotal(items);

    const paypalOrderId = await this.paypalService.createPayment(
      totalPrice,
      'USD'
    );

    const invoice = await invoiceModel.create({
      userId: req.userId,
      shippingInfo: {
        email: req.shippingInfo.email,
        address: req.shippingInfo.address,
        phone: req.shippingInfo.phone,
      },
      paypalOrderId,
      totalPrice,
      status: InvoiceStatus.PENDING,
      items,
    });

    logger.info('[Invoice] Invoice created', { invoiceId: invoice._id, totalPrice });
    return invoice;
  }

  async checkoutCart(
    email: string,
    shippingInfo: { email: string; address: string; phone: string }
  ) {
    const user = await this.userService.findUserByEmail(email);
    const cartItems = await this.cartService.getCart(email);

    if (cartItems.length === 0) throw Error.CartIsEmpty;

    // ✅ FIX #1 — Idempotency: kiểm tra user đã có PENDING invoice chưa
    const existingPending = await invoiceModel.findOne({
      userId: user._id.toString(),
      status: InvoiceStatus.PENDING,
    });
    if (existingPending) {
      logger.warn('[Invoice] Duplicate checkout attempt blocked', {
        userId: user._id,
        existingInvoiceId: existingPending._id,
      });
      throw Error.InvoiceAlreadyPending;
    }

    const invoiceItems = cartItems.map((item) => ({
      productId: item.productId.toString(),
      variantId: item.variantId,
      name: item.name || 'No name',
      size: item.size,
      color: item.color,
      imageUrl: item.imageUrl,
      price: item.price,
      quantity: item.quantity,
    }));

    // ✅ FIX #5 — Stock check trước khi tạo PayPal order
    await this.validateStock(invoiceItems);

    const req: InvoiceRequest = {
      userId: user._id.toString(),
      shippingInfo,
      items: invoiceItems,
    };

    return this.createInvoice(req);
  }

  async buyNow(
    email: string,
    buyNowDto: BuyNowDTO & {
      shippingInfo: { email: string; address: string; phone: string };
    }
  ) {
    const { quantity, variantId, productId, shippingInfo } = buyNowDto;
    const user = await this.userService.findUserByEmail(email);
    const product = await this.productService.getProductAndVariant(
      productId,
      variantId
    );
    const { colorVariant, sizeEntry, name, price } = product;
    const { color, imageUrls } = colorVariant;
    const { size } = sizeEntry;
    const imageUrl = imageUrls[0] ?? '';

    const invoiceItems = [
      {
        productId,
        variantId: sizeEntry._id.toString(),
        name,
        size,
        color,
        imageUrl,
        price,
        quantity,
      },
    ];

    // ✅ FIX #5 — Stock check cho Buy Now
    await this.validateStock(invoiceItems);

    const req: InvoiceRequest = {
      userId: user._id.toString(),
      shippingInfo,
      items: invoiceItems,
    };

    return this.createInvoice(req);
  }

  async captureInvoice(paypalOrderId: string) {
    const invoice = await this.findInvoiceByPaypalOrderId(paypalOrderId);

    // ✅ FIX #2 — Idempotency: không capture lại nếu đã COMPLETED
    if (invoice.status === InvoiceStatus.COMPLETED) {
      logger.info('[Invoice] Capture skipped — already completed', {
        paypalOrderId,
        invoiceId: invoice._id,
      });
      return invoice;
    }

    // ✅ FIX #2 — Không capture nếu đã CANCELLED
    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw Error.InvoiceAlreadyCaptured;
    }

    let result: any;
    try {
      const request = await this.paypalService.executePayment(invoice.paypalOrderId);
      result = request;
    } catch (err: any) {
      // ✅ FIX #6 — Reliability: nếu PayPal capture lỗi → CANCEL invoice, không để PENDING mãi mãi
      logger.error('[Invoice] PayPal capture failed — marking invoice as CANCELLED', {
        paypalOrderId,
        invoiceId: invoice._id,
        error: err.message,
      });
      invoice.status = InvoiceStatus.CANCELLED;
      await invoice.save();
      throw err;
    }

    const isCompleted = result?.status === 'COMPLETED';
    invoice.status = isCompleted ? InvoiceStatus.COMPLETED : InvoiceStatus.CANCELLED;
    await invoice.save();

    // ✅ Chỉ clear cart khi thanh toán thành công
    if (isCompleted) {
      await this.cartService.clearCart(invoice.userId);
    }

    logger.info('[Invoice] Payment captured', {
      invoiceId: invoice._id,
      paypalOrderId,
      status: invoice.status,
    });

    return invoice;
  }

  // ─── Queries ──────────────────────────────────────────────────────────────────

  async findInvoice(invoiceId: string) {
    const invoice = await invoiceModel.findById(invoiceId);
    if (!invoice) throw Error.InvoiceNotFound;
    return invoice;
  }

  async findInvoiceByPaypalOrderId(paypalOrderId: string) {
    const invoice = await invoiceModel.findOne({ paypalOrderId });
    if (!invoice) throw Error.InvoiceNotFound;
    return invoice;
  }

  async getInvoice(pagination: Pagination) {
    const { limit } = pagination;

    const [invoices, total] = await Promise.all([
      invoiceModel
        .find()
        .skip(pagination.getOffSet())
        .limit(limit)
        .sort({ createdAt: -1 }),
      invoiceModel.countDocuments(),
    ]);

    pagination.total = total;
    return { items: invoices, pagination };
  }

  async getInvoicesByUser(
    email: string,
    pagination: Pagination,
    filter: InvoiceFilterDTO
  ) {
    const { _id: userId } = await this.userService.findUserByEmail(email);

    const query: Record<string, unknown> = { userId };
    if (filter.status) {
      query.status = filter.status;
    }

    const [invoices, total] = await Promise.all([
      invoiceModel
        .find(query)
        .skip(pagination.getOffSet())
        .limit(pagination.limit)
        .sort({ createdAt: -1 }),
      invoiceModel.countDocuments(query),
    ]);

    pagination.total = total;
    return { items: invoices, pagination };
  }

  async updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    const invoice = await this.findInvoice(invoiceId);
    invoice.status = status;
    await invoice.save();
    logger.info('[Invoice] Status updated', { invoiceId, status });
    return invoice;
  }
}
