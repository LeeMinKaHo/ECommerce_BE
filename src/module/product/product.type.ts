import { Types } from "mongoose";
import { ICategory } from "./model/category.model";
import { IProduct } from "./model/product.model";

export enum ProductDelete {
   init = 0,
   delete = 1,
}
export type ProductType = IProduct & { categoryId: ICategory };
interface Variant {
   _id: Types.ObjectId;
   color: string;
   size: string;
   imageUrl: string;
   stock: number;
   // ... các field khác trong variant
}

export interface ProductWithVariant {
   _id: Types.ObjectId;
   name: string;
   price: number;
   categoryName: string;
   variant: Variant;
}
