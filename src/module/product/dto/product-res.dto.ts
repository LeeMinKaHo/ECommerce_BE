import { Expose, plainToInstance, Transform, Type } from "class-transformer";
import { IProduct } from "../model/product.model";
import { ProductType } from "../product.type";

export class ProductResDTO {
   @Expose()
   _id: string;
   @Expose()
   name: string;

   @Expose()
   categoryName: string;
   @Expose()
   defaultImage?: string;
   @Expose()
   price: number;

   @Expose()
   totalReview: number;

   @Expose()
   rating: number;
   @Expose()
   quantity: number;
   @Expose()
   quantitySold: number;

   @Expose({ name: 'colorVariants' })
   variants: any[];

   @Expose()
   createdAt: string;

   @Expose()
   videoUrl?: string; // catwalk / outfit video

   @Expose()
   isActive: boolean;

   static fromEntity(data: IProduct) {
      const plainData = data.toObject();
      return plainToInstance(
         ProductResDTO,
         {
            ...plainData,
            _id: plainData._id?.toString(), // <--- ép về string
         },
         { excludeExtraneousValues: true }
      );
   }
}
