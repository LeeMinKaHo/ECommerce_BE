import { Expose, plainToInstance } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductDTO {
   @Expose()
   @IsString()
   @IsNotEmpty()
   name: string;

   @Expose()
   @IsString()
   @IsNotEmpty()
   description: string;

   @Expose()
   @IsNumber()
   @IsNotEmpty()
   quanlity: number;

   @Expose()
   @IsNumber()
   @IsNotEmpty()
   price: number;

   @Expose()
   @IsString()
   @IsNotEmpty()
   createBy: string;
   @Expose()
   @IsString()
   categoryId : string
   @Expose()
   @IsArray()
   variants : Variants[]
   static fromRequest(data: any) {
      return plainToInstance(CreateProductDTO, data, {
         excludeExtraneousValues: true,
      });
   }
}
export class Variants {
   @Expose()
   productId : string
   @Expose()
   sizeId : string
   @Expose()
   color : string
   @Expose()
   imgUrl : string
   @Expose()
   quantity : number
}