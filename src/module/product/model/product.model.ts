import mongoose, { Document, Schema } from "mongoose";
import { ICategory } from "./category.model";
import colorVariantModel, { IColorVariant } from "./product-variant.model";
import reviewModel, { IReview } from "../../reviews/review.model";

export interface IProduct extends Document {
   name: string;
   description: string;
   defaultImage?: string; // Thêm trường imgUrl nếu cần
   quantity: number;
   quantitySold: number;
   price: number;
   rating?: number; // Thêm trường rating nếu cần
   totalReview?: number; // Thêm trường totalReview nếu cần
   createBy: mongoose.Types.ObjectId;
   categoryId: ICategory; // 👈 Thêm dòng này
   categoryName : string;
   colorVariants: IColorVariant[]; // Nhóm theo màu
   reviews: IReview[];
   isDeleted: boolean;
   embedding?: number[];
}

const ProductSchema: Schema = new Schema({
   name: { type: String, required: true },
   rating : { type: Number, default: 0 },
   totalReview: { type: Number, default: 0 },
   description: { type: String, required: true },
   defaultImage: { type: String, default: null }, // Thêm trường imgUrl nếu cần
   quantity: { type: Number, required: true, default: 0 },
   quantitySold: { type: Number, required: true, default: 0 },
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
   colorVariants: [colorVariantModel.schema], // Nhóm theo màu
   reviews: [reviewModel.schema],
   isDeleted: { type: Boolean, default: false },
   embedding: { type: [Number], default: [] },
});

export default mongoose.model<IProduct>("Product", ProductSchema);
