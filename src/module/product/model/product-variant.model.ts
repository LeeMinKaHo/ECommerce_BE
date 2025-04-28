import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProductVariant extends Document {
   productId: Types.ObjectId; // hoặc bạn có thể dùng string
   sizeId: Types.ObjectId;
   color : string,
   imageUrl : string
   quantity: number;
}
const productVariantSchema = new Schema<IProductVariant>({
   productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
   sizeId: { type: Schema.Types.ObjectId, ref: "Size", required: true },
   color: { type: String, required: true },       // "Red", "Black", ...
   imageUrl: { type: String, required: true },    // Ảnh minh họa cho màu đó
   quantity: { type: Number, required: true, default: 0 },
});
export default mongoose.model<IProductVariant>("ProductVariant", productVariantSchema);
