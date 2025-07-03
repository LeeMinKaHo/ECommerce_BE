import { Schema, model, Types , Document } from "mongoose";
import { IProductVariant } from "../product/model/product-variant.model";

export interface ICartItem  extends Document {
    userId: Types.ObjectId; // ID của người dùng
    productVariantId: Types.ObjectId// ID của sản phẩm
    quantity: number; // Số lượng sản phẩm trong giỏ hàng
}

const CartItemSchema = new Schema<ICartItem>(
    {
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        productVariantId: { type: Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true, min: 1 },
    },
    { timestamps: true }
);

export const CartModel = model<ICartItem>("CartItem", CartItemSchema);