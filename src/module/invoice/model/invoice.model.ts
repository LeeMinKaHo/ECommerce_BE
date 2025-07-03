import mongoose, { Document, Schema } from "mongoose";

export enum InvoiceStatus {
   PENDING = 0,
   COMPLETED = 1,
   CANCELLED = 2,
}

// Kiểu dữ liệu cho từng item trong hóa đơn
interface InvoiceItem {
   productVariantId: mongoose.Types.ObjectId;
   name: string;
   size: string;
   color: string;
   imageUrl?: string;
   price: number;
   quantity: number;
   total: number;
}

export interface IInvoice extends Document {
   userId: string;
   paypalInvoiceId: string;
   totalPrice: number;
   status: InvoiceStatus;
   items: InvoiceItem[];
}

const InvoiceItemSchema = new Schema<InvoiceItem>(
   {
      productVariantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true },
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

const InvoiceSchema = new Schema<IInvoice>(
   {
      userId: { type: String, required: true },
      paypalInvoiceId: { type: String, required: true },
      totalPrice: { type: Number, required: true },
      status: { type: Number, enum: Object.values(InvoiceStatus), default: InvoiceStatus.PENDING },
      items: { type: [InvoiceItemSchema], required: true },
   },
   { timestamps: true }
);

export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);
