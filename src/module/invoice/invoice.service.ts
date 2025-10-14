import { Inject, Service } from "typedi";
import { CartService } from "../cart/cart.service";
import { PayPalService } from "../paypal/paypal.service";
import { Pagination } from "../shared/dto/pagination.dto";
import { Error } from "../shared/error/error-custom";
import { UserService } from "../user/user.service";
import invoiceModel, { InvoiceStatus } from "./model/invoice.model";
import { InvoiceRequest, InvoiceRequestItem } from "./model/invoice.type";
import { ProductService } from "../product/product.service";
import { BuyNowDTO } from "./dto/buy-now.dto";
@Service()
export class InvoiceService {
   constructor(
      @Inject() private paypalService: PayPalService,
      @Inject() private cartService: CartService,
      @Inject() private userService: UserService,
      @Inject() private productService: ProductService
   ) {}
   private buildInvoiceItems(items: InvoiceRequestItem[]) {
      return items.map((item) => ({
         ...item,
         total: item.price * item.quantity,
      }));
   }

   private calculateTotal(items: InvoiceRequestItem[]) {
      return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
   }
   createInvoice = async (req: InvoiceRequest) => {
      const items = this.buildInvoiceItems(req.items);
      const totalPrice = this.calculateTotal(req.items);

      const paypalOrderId = await this.paypalService.createPayment(
         totalPrice,
         "USD"
      );

      const invoice = await invoiceModel.create({
         userId: req.userId, // user phải đăng nhập
         shippingInfo: {
            name: req.shippingInfo.name ? "req.shippingInfo.name" : "No name",
            address: req.shippingInfo.address
               ? req.shippingInfo.address
               : "No address",
            phone: req.shippingInfo.phone ? req.shippingInfo.phone : "No phone",
         },
         paypalOrderId,
         totalPrice,
         status: InvoiceStatus.PENDING,
         items,
      });

      return invoice;
   };
   async checkoutCart(email: string) {
      console.log("Checkout cart for email:", email);
      const user = await this.userService.findUserByEmail(email);
      console.log("User found:", user);
      const cartItems = await this.cartService.getCart(email);
      if (cartItems.length === 0) throw Error.CartIsEmpty;
      console.log(cartItems);
      const req: InvoiceRequest = {
         userId: user._id.toString(), // convert luôn cho đồng bộ
         shippingInfo: {
            name: "No name",
            address: "No address",
            phone: "No phone",
         },
         items: cartItems.map((item) => ({
            productId: item.productId.toString(), // convert ObjectId → string
            variantId: item.variantId,
            name: item.name || "No name",
            size: item.size,
            color: item.color,
            imageUrl: item.imageUrl,
            price: item.price,
            quantity: item.quantity,
         })),
      };
      console.log("req", req);
      return this.createInvoice(req);
   }
   async buyNow(email: string, buyNowDto: BuyNowDTO) {
      const { quantity, variantId, productId } = buyNowDto;
      const user = await this.userService.findUserByEmail(email);
      const product = await this.productService.getProductAndVariant(
         productId,
         variantId
      );
      const { variant, name, price } = product;
      const { color, size, imageUrl } = variant;
      const req: InvoiceRequest = {
         userId: user._id,
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

   captureInvoice = async (invoiceId: string) => {
      const invoice = await this.findInvoiceByPaypalOrderId(invoiceId);
      const status = await this.paypalService.executePayment(
         invoice.paypalOrderId
      );
      console.log(status);
      if (status === "COMPLETED") {
         invoice.status = InvoiceStatus.COMPLETED;
         await invoice.save();
      } else {
         // capture thất bại
         invoice.status = InvoiceStatus.CANCELLED;
         await invoice.save();
      }

      await this.cartService.clearCart(invoice.userId);
      return status;
   };
   findInvoice = async (invoiceId: string) => {
      const invoice = await invoiceModel.findById(invoiceId);
      if (!invoice) throw Error.InvoiceNotFound;
      return invoice;
   };
   getInvoice = async (pagination: Pagination) => {
      const { limit } = pagination;

      const invoices = await invoiceModel
         .find()
         .skip(pagination.getOffSet())
         .limit(limit)
         .lean();

      // Với mỗi invoice, truy vấn thêm danh sách item
      const invoiceIds = invoices.map((inv) => inv._id);
      const items = await invoiceModel
         .find({ _id: { $in: invoiceIds } })
         .select("items")
         .lean();
   };
   findInvoiceByPaypalOrderId = async (paypalOrderId: string) => {
      const invoice = await invoiceModel.findOne({ paypalOrderId });
      if (!invoice) throw Error.InvoiceNotFound;
      return invoice;
   };
}
