import { Expose, plainToInstance, Transform } from "class-transformer";
import {
   IsNotEmpty,
   IsNumber,
   IsOptional,
   IsString,
   Min,
} from "class-validator";

export class AddCartDTO {
 
   @Expose()
   @IsNotEmpty()
   @IsString()
   productVariantId: string;

   @Expose()
   @IsOptional()
   @IsNumber()
   @Min(1)
   @Transform(({ value }) => (value !== undefined ? Number(value) : 1))
   quantity: number;

   static fromRequest(body: any) {
      return plainToInstance(AddCartDTO, body, {
         excludeExtraneousValues: true,
      });
   }
}

