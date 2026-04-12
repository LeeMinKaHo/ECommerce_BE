import { Types } from "mongoose";
import { ICategory } from "./model/category.model";
import { IProduct } from "./model/product.model";

export enum ProductDelete {
   init = 0,
   delete = 1,
}

export type ProductType = IProduct & { categoryId: ICategory };

// Một size bên trong colorVariant
export interface SizeEntry {
   _id: Types.ObjectId;
   size: string;
   quantity: number;
}

// Variant theo màu
export interface ColorVariant {
   _id: Types.ObjectId;
   color: string;
   imageUrls: string[];
   sizes: SizeEntry[];
}

export interface ProductWithVariant {
   _id: Types.ObjectId;
   name: string;
   price: number;
   categoryName: string;
   colorVariant: ColorVariant;   // 1 colorVariant được tìm thấy
   sizeEntry: SizeEntry;         // 1 size cụ thể trong colorVariant đó
}
