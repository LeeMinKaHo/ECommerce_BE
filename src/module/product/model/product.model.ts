import mongoose, { Document, Schema } from "mongoose";
import { ICategory } from "./category.model";
import productVariantModel, { IProductVariant } from "./product-variant.model";

export interface IProduct extends Document {
   name: string;
   description: string;
   quanlity: number;
   quanlitySold: number;
   price: number;
   createBy: mongoose.Types.ObjectId;
   categoryId: ICategory; // 👈 Thêm dòng này
   variants: IProductVariant[]; // Thêm trường variants
   isDeleted: boolean;
}

const ProductSchema: Schema = new Schema({
   name: { type: String, required: true },
   description: { type: String, required: true },
   quanlity: { type: Number, required: true, default: 0 },
   quanlitySold: { type: Number, required: true, default: 0 },
   price: { type: Number, required: true, min: 0 },
   createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // 👈 Đây là tên model ông muốn populate
      required: true,
   },
   variants: [productVariantModel.schema], // Thêm trường variants
   isDeleted: { type: Boolean, default: false },
});

export default mongoose.model<IProduct>("Product", ProductSchema);
