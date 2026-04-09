import { Inject, Service } from 'typedi';
import { CartService } from '../cart/cart.service';
import { PayPalService } from '../paypal/paypal.service';
import { Pagination } from '../shared/dto/pagination.dto';
import { Error } from '../shared/error/error-custom';
import { UserService } from '../user/user.service';
import invoiceModel, { InvoiceStatus } from './model/invoice.model';
import { InvoiceRequest, InvoiceRequestItem } from './model/invoice.type';
import { ProductService } from '../product/product.service';
import { BuyNowDTO } from './dto/buy-now.dto';
import { InvoiceFilterDTO } from './dto/filter.dto';
import { logger } from '../shared/middleware/logger';

@Service()
export class InvoiceService {
  constructor(
    @Inject() private paypalService: PayPalService,
    @Inject() private cartService: CartService,
    @Inject() private userService: UserService,
    @Inject() private productService: ProductService
  ) {}

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

    const req: InvoiceRequest = {
      userId: user._id.toString(),
      shippingInfo,
      items: cartItems.map((item) => ({
        productId: item.productId.toString(),
        variantId: item.variantId,
        name: item.name || 'No name',
        size: item.size,
        color: item.color,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: item.quantity,
      })),
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
    const { variant, name, price } = product;
    const { color, size, imageUrl } = variant;

    const req: InvoiceRequest = {
      userId: user._id.toString(),
      shippingInfo, // ✅ không còn bị bỏ quên
      items: [
        {
          productId,
          variantId: variant._id.toString(),
          name,
          size,
          color,
          imageUrl,
          price,
          quantity,
        },
      ],
    };

    return this.createInvoice(req);
  }

  async captureInvoice(invoiceId: string) {
    const invoice = await this.findInvoiceByPaypalOrderId(invoiceId);

    // PayPal trả về object, lấy .status để so sánh
    const result = await this.paypalService.executePayment(invoice.paypalOrderId);
    const isCompleted = result?.status === 'COMPLETED';

    invoice.status = isCompleted ? InvoiceStatus.COMPLETED : InvoiceStatus.CANCELLED;
    await invoice.save();

    // ✅ Chỉ clear cart khi thanh toán thành công
    if (isCompleted) {
      await this.cartService.clearCart(invoice.userId);
    }

    logger.info('[Invoice] Payment captured', {
      invoiceId: invoice._id,
      paypalOrderId: invoiceId,
      status: invoice.status,
    });

    return result;
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
