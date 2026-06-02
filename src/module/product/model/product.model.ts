import mongoose, { Document, Schema } from "mongoose";
import { ICategory } from "./category.model";
import colorVariantModel, { IColorVariant } from "./product-variant.model";
import reviewModel, { IReview } from "../../reviews/review.model";

export interface ISizeGuideRow {
   size: string;
   chest?: string;
   waist?: string;
   hip?: string;
   length?: string;
   shoulder?: string;
   sleeve?: string;
   thigh?: string;
   width?: string;
}

export interface ISizeGuide {
   type: 'tops' | 'bottoms' | 'accessories' | 'custom';
   unit: 'cm' | 'inch';
   rows: ISizeGuideRow[];
}

export interface IProduct extends Document {
   name: string;
   description: string;
   details?: string[];
   sizeGuide?: ISizeGuide;
   defaultImage?: string;
   videoUrl?: string;       // catwalk / outfit video
   quantity: number;
   quantitySold: number;
   price: number;
   rating?: number;
   totalReview?: number;
   createBy: mongoose.Types.ObjectId;
   categoryId: ICategory;
   categoryName: string;
   colorVariants: IColorVariant[];
   reviews: IReview[];
   isDeleted: boolean;
   isActive: boolean;
   embedding?: number[];
}

const SizeGuideRowSchema = new Schema(
   {
      size:     { type: String, required: true },
      chest:    { type: String },
      waist:    { type: String },
      hip:      { type: String },
      length:   { type: String },
      shoulder: { type: String },
      sleeve:   { type: String },
      thigh:    { type: String },
      width:    { type: String },
   },
   { _id: false }
);

const SizeGuideSchema = new Schema(
   {
      type: { type: String, enum: ['tops', 'bottoms', 'accessories', 'custom'], default: 'custom' },
      unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
      rows: { type: [SizeGuideRowSchema], default: [] },
   },
   { _id: false }
);

const ProductSchema: Schema = new Schema({
   name: { type: String, required: true },
   rating: { type: Number, default: 0 },
   totalReview: { type: Number, default: 0 },
   description: { type: String, required: true },
   details: { type: [String], default: [] },
   sizeGuide: { type: SizeGuideSchema, default: null },
   defaultImage: { type: String, default: null },
   videoUrl: { type: String, default: null },      // catwalk / outfit video
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
      ref: "Category",
      required: true,
   },
   colorVariants: [colorVariantModel.schema],
   reviews: [reviewModel.schema],
   isDeleted: { type: Boolean, default: false },
   isActive: { type: Boolean, default: true },
   embedding: { type: [Number], default: [] },
}, { timestamps: true }); // auto createdAt & updatedAt

export default mongoose.model<IProduct>("Product", ProductSchema);
