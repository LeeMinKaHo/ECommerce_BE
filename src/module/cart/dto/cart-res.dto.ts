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
    const variant = item.productVariantId;
    const product = variant.productId;
    console.log("item", item);
    const data: CartResDTO = {
      cartItemId: item._id.toString(),
      name: product.name,
      imageUrl: variant.imageUrl,
      sizeName: variant.sizeId.name,
      color: variant.color,
      price: product.price,
      quantity: item.quantity,
      totalPrice: product.price * item.quantity,
    };

    return plainToInstance(CartResDTO, data, {
      excludeExtraneousValues: true,
    });
  }
}
