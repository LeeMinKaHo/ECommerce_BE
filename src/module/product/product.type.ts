import { ICategory } from "./model/category.model";
import { IProduct } from "./model/product.model";

export enum ProductDelete {
    init = 0 ,
    delete =1
}
export type ProductType = IProduct & { categoryId: ICategory };
