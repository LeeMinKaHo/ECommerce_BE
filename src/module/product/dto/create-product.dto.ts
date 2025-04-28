import { Expose, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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

   static fromRequest(data: any) {
      return plainToInstance(CreateProductDTO, data, {
         excludeExtraneousValues: true,
      });
   }
}
