import { Expose, plainToInstance } from "class-transformer";

export class CartResDTO {
   @Expose()
   cartItemId: string;
   @Expose()
   name: string;
   @Expose()
   sizeName : string;
   @Expose()
   color : string;
   @Expose()
   price: number;
   @Expose()
   quantity: number;
   @Expose()
   imageUrl: string;
   @Expose()
   totalPrice: number;
   static toCartResDTO(data: any) {
      return plainToInstance(CartResDTO, data, {
         excludeExtraneousValues: true,
      });
   }
   static fromEntity(item: any): CartResDTO {
    return plainToInstance(CartResDTO, item, {
      excludeExtraneousValues: true,
    });
  }
}
