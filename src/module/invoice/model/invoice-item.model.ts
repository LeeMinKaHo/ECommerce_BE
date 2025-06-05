import { model, Schema, Types } from "mongoose";

// Chỉnh sửa ở đây: thay 'string' thành 'Types.ObjectId' 
export interface IInvoiceItem {
   productVariantId: Types.ObjectId;  // Đổi thành ObjectId
   quantity: number;
   price: number;
   totalPrice: number;
   invoiceId: Types.ObjectId;  // Đổi thành ObjectId
}

const InvoiceItemSchema = new Schema<IInvoiceItem>({
    productVariantId: { 
        type: Schema.Types.ObjectId,  // Vẫn là ObjectId
        ref: "ProductVariant", 
        required: true 
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    invoiceId: { 
        type: Schema.Types.ObjectId,  // Vẫn là ObjectId
        ref: "Invoice", 
        required: true 
    },
});

export default model<IInvoiceItem>("InvoiceItem", InvoiceItemSchema);
