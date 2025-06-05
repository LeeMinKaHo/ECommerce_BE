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
      @Inject() private userService :UserService 
   ) {}
   createInvoice = async (email : string) => {
      // const {_id : userId} = await this.userService.findUserByEmail(email) 
      // const session = await mongoose.startSession();
      // session.startTransaction();
      // const cartItems = await this.cartService.getCart(email);
      // if (cartItems.length === 0) {
      //    throw Error.CartIsEmpty;
      // }
      // const totalPrice = cartItems.reduce((sum, item) => {
      //    const variant = item.productVariantId as IProductVariant;
      //    const product = variant.productId as IProduct;
      //    const price = product.price || 0;
      //    return sum + price * item.quantity;
      // }, 0);
      // const paypalOrderId = await this.paypalService.createPayment(
      //    totalPrice,
      //    "USD"
      // );
      // try {
      //    // 1. Lấy cart items theo user

      //    // 2. Tính tổng tiền

      //    // 3. Tạo invoice
      //    const invoice = new invoiceModel({
      //       userId,
      //       totalPrice,
      //       status: InvoiceStatus.PENDING,
      //       paypalInvoiceId: paypalOrderId, // Optional field for PayPal order ID
      //    });
      //    const invoiceItems = cartItems.map((item) => {
      //       const variant = item.productVariantId as IProductVariant;
      //       const product = variant.productId as IProduct;
      //       const price = product.price || 0;

      //       return new invoiceItemModel({
      //          invoiceId: invoice._id,
      //          price,
      //          productVariantId: variant._id,
      //          quantity: item.quantity,
      //          totalPrice: price * item.quantity,
      //       }).save({ session });
      //    });

      //    await Promise.all(invoiceItems);

      //    await invoice.save({ session });

      //    // 4. (Tuỳ chọn) Xoá giỏ hàng sau khi tạo đơn
      //    await this.cartService.clearCart(userId);

      //    // 5. Commit transaction
      //    await session.commitTransaction();
      //    session.endSession();

      //    return invoice;
      // } catch (error) {
      //    await session.abortTransaction();
      //    session.endSession();
      //    throw error;
      // }
   };
   captureInvoice = async (invoiceId: string) => {
      console.log(invoiceId);
      // const invoice = await this.findInvoice(invoiceId);
      // const status = await this.paypalService.executePayment(
      //    invoice.paypalInvoiceId
      // );
      const invoice = await invoiceModel.findOne({
         paypalInvoiceId: invoiceId,
      });
      const status = await this.paypalService.executePayment(invoiceId);
      console.log(status);
      if (status === "COMPLETED") {
         invoice.status = InvoiceStatus.COMPLETED;
         await invoice.save();
      } else {
         // capture thất bại
         invoice.status = InvoiceStatus.CANCELLED;
         await invoice.save();
      }
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
