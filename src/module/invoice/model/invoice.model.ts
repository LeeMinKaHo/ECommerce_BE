import mongoose, { Document, Schema, Types } from "mongoose";

export enum InvoiceStatus {
   PENDING = "PENDING",
   COMPLETED = "COMPLETED",
   CANCELLED = "CANCELLED",
}

// Kiểu dữ liệu cho từng item trong hóa đơn
interface InvoiceItem {
   productId: Types.ObjectId;
   variantId: string;
   name: string;
   size: string;
   color: string;
   imageUrl?: string;
   price: number;
   quantity: number;
   total: number;
}

const InvoiceItemSchema = new Schema<InvoiceItem>(
   {
      productId: {
         type: Schema.Types.ObjectId,
         required: true,
         ref: "Product",
      },
      variantId: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: String, required: true },
      color: { type: String, required: true },
      imageUrl: { type: String },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      total: { type: Number, required: true },
   },
   { _id: false } // không tạo _id riêng cho từng item
);
export interface IInvoice extends Document {
   userId: string; // user phải đăng nhập
   shippingInfo: {
      name: string;
      address: string;
      phone: string;
   };
   paypalOrderId: string;
   totalPrice: number;
   status: InvoiceStatus;
   items: InvoiceItem[];
}

const InvoiceSchema = new Schema<IInvoice>(
   {
      userId: { type: String, required: true },
      shippingInfo: {
         email: { type: String, required: true },
         address: { type: String, required: true },
         phone: { type: String, required: true },
      },
      paypalOrderId: { type: String, required: true },
      totalPrice: { type: Number, required: true },
      status: {
         type: String,
         enum: Object.values(InvoiceStatus),
         default: InvoiceStatus.PENDING,
      },
      items: { type: [InvoiceItemSchema], required: true },
   },
   { timestamps: true }
);

export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);
