import { Inject, Service } from "typedi";
import { PayPalService } from "../paypal/paypal.service";
import mongoose from "mongoose";
import { CartService } from "../cart/cart.service";
import productVariantModel, {
   IProductVariant,
} from "../product/model/product-variant.model";
import productModel, { IProduct } from "../product/model/product.model";
import invoiceModel, { InvoiceStatus } from "./model/invoice.model";
import invoiceItemModel from "./model/invoice-item.model";
import { Error } from "../shared/error/error-custom";
import { Pagination } from "../shared/dto/pagination.dto";
import { UserService } from "../user/user.service";
@Service()
export class InvoiceService {
   constructor(
      @Inject() private paypalService: PayPalService,
      @Inject() private cartService: CartService,
      @Inject() private userService: UserService
   ) {}
   createInvoice = async (email: string) => {
      const user = await this.userService.findUserByEmail(email);
      const cartItems = await this.cartService.getCart(email);
      if (cartItems.length === 0) {
         throw Error.CartIsEmpty;
      }
      const totalPrice = await this.cartService.getTotalPrice(email);

      const paypalOrderId = await this.paypalService.createPayment(
         totalPrice,
         "USD"
      );
      const invoiceItems = cartItems.map((item) => {
         const variant = item.product; // giả sử từ $lookup vào product
         const quantity = item.quantity;
         const price = variant.price;
         return {
            productVariantId: item.productVariantId,
            name: variant.name,
            size: variant.variant.size,
            color: variant.variant.color,
            imageUrl: variant.variant.imageUrl,
            price: price,
            quantity: quantity,
            total: price * quantity,
         };
      });
      const invoice = await invoiceModel.create({
         userId: user._id,
         paypalInvoiceId: paypalOrderId,
         totalPrice,
         status: InvoiceStatus.PENDING,
         items: invoiceItems,
      });
      return invoice._id
   };
   captureInvoice = async (invoiceId: string) => {
      console.log(invoiceId);
      // const invoice = await this.findInvoice(invoiceId);
      // const status = await this.paypalService.executePayment(
      //    invoice.paypalInvoiceId
      // );
      const invoice = await this.findInvoice(invoiceId);
      const status = await this.paypalService.executePayment(invoice.paypalInvoiceId);
      console.log(status);
      if (status === "COMPLETED") {
         invoice.status = InvoiceStatus.COMPLETED;
         await invoice.save();
      } else {
         // capture thất bại
         invoice.status = InvoiceStatus.CANCELLED;
         await invoice.save();
      }
      this.cartService.clearCart(invoice.userId);
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

      const items = await invoiceItemModel
         .find({
            invoiceId: { $in: invoiceIds },
         })
         .populate({
            path: "productVariantId",
            populate: {
               path: "productId", // nối tiếp đến bảng Product
               select: "name", // chỉ lấy tên sản phẩm
            },
         })
         .lean();

      // Gắn items vào từng invoice
      const invoiceWithItems = invoices.map((inv) => {
         return {
            ...inv,
            items: items.filter(
               (item) => item.invoiceId.toString() === inv._id.toString()
            ),
         };
      });

      return invoiceWithItems;
   };
}
