import { Expose, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateReviewDTO {
   @Expose()
   @IsNotEmpty()
   @IsNumber()
   star: number;
   @Expose()
   @IsNotEmpty()
   @IsString()
   headline: string;
   @Expose()
   @IsNotEmpty()
   @IsString()
   content: string;
   @Expose()
   @IsNotEmpty()
   productId: string;
   @Expose()
   @IsNotEmpty()
   userId: string;
   static fromRequest(data: any) {
      return plainToInstance(CreateReviewDTO, data, {
         excludeExtraneousValues: true,
      });
   }
}
