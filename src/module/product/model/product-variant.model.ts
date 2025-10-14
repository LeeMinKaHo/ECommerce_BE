import mongoose, { Document, Schema } from "mongoose";

export interface IProductVariant extends Document {
   size: string;
   color : string,
   imageUrl : string
   quantity: number;
}
const productVariantSchema = new Schema<IProductVariant>({
   size: { type: String , required: true }, // "S", "M", "L", ...
   color: { type: String, required: true },       // "Red", "Black", ...
   imageUrl: { type: String, required: true },    // Ảnh minh họa cho màu đó
   quantity: { type: Number, required: true, default: 0 },
} );
export default mongoose.model<IProductVariant>("ProductVariant", productVariantSchema);
