import { Schema, model, Types , Document } from "mongoose";
import { IProductVariant } from "../product/model/product-variant.model";

export interface ICartItem  extends Document {
    userId: Types.ObjectId; // ID của người dùng
    size : string; // Kích thước của sản phẩm
    color : string; // Màu sắc của sản phẩm
    productId : Types.ObjectId; // ID của sản phẩm
    variantId:string; // ID của biến thể sản phẩm
    name : string; // Tên của sản phẩm
    imageUrl : string ;
    price : number; // Giá của sản phẩm
    quantity: number; // Số lượng sản phẩm trong giỏ hàng
}

const CartItemSchema = new Schema<ICartItem>(
    {
        variantId: { type: String, required: true }, // ID của biến thể sản phẩm
        productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" }, // ID của sản phẩm
        userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
        name: { type: String, required: true }, // Tên của sản phẩm
        size: { type: String, required: true }, // Kích thước của sản phẩm
        color: { type: String, required: true }, // Màu sắc của sản phẩm
        imageUrl: { type: String, required: true }, // Hình ảnh của sản phẩm
        price: { type: Number, required: true }, // Giá của sản phẩm
        quantity: { type: Number, required: true, min: 1 },
    },
    { timestamps: true }
);

export const CartModel = model<ICartItem>("CartItem", CartItemSchema);