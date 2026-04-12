import mongoose, { Document, Schema } from "mongoose";

export interface IColorVariant extends Document {
   color: string;
   imageUrls: string[];  // Nhiều ảnh cho 1 màu (gallery)
   sizes: {
      _id?: mongoose.Types.ObjectId;
      size: string;
      quantity: number;
   }[];
}

const colorVariantSchema = new Schema<IColorVariant>({
   color: { type: String, required: true },
   imageUrls: { type: [String], required: true },   // ảnh lưu 1 lần theo màu
   sizes: [
      {
         size: { type: String, required: true },
         quantity: { type: Number, required: true, default: 0 },
      },
   ],
});

export default mongoose.model<IColorVariant>("ColorVariant", colorVariantSchema);
