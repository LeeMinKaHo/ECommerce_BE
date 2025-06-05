import mongoose, { Document, Schema, Types } from "mongoose";
import { IProduct } from "./product.model";
import { ISize } from "./size.model";

export interface IProductVariant extends Document {
   sizeId: Types.ObjectId | ISize;
   color : string,
   imageUrl : string
   quantity: number;
}
const productVariantSchema = new Schema<IProductVariant>({
   sizeId: { type: Schema.Types.ObjectId, ref: "Size", required: true },
   color: { type: String, required: true },       // "Red", "Black", ...
   imageUrl: { type: String, required: true },    // Ảnh minh họa cho màu đó
   quantity: { type: Number, required: true, default: 0 },
} );
export default mongoose.model<IProductVariant>("ProductVariant", productVariantSchema);
