import mongoose, { Document, Schema } from "mongoose";

export enum InvoiceStatus {
   PENDING = 0,
   COMPLETED = 1,
   CANCELLED = 2,
}
export interface IInvoice extends Document {
   userId: string;
   paypalInvoiceId: string; // Optional field for PayPal order ID
   totalPrice: number;
   status: InvoiceStatus; // "pending", "completed", "cancelled"
}

const InvoiceSchema = new Schema<IInvoice>(
   {
      userId: { type: String, required: true },
      totalPrice: { type: Number, required: true },
      paypalInvoiceId: { type: String, required: true }, // Optional field for PayPal order ID
      status: { type: Number, default: InvoiceStatus.PENDING }, // Default to "pending"
   },
   {
      timestamps: true,
   }
);
export default mongoose.model<IInvoice>("Invoice", InvoiceSchema);
