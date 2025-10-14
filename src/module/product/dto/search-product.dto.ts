import { plainToInstance } from "class-transformer";
import { IsOptional } from "class-validator";

export class SearchProductDTO {
   @IsOptional()
   productId: string;
   @IsOptional()
   sizeId: string;
   @IsOptional()
   color: string;
   @IsOptional()
   minPrice: number;
   @IsOptional()
   maxPrice: number;
   @IsOptional()
   name: string;
   static fromRequest(data: any) {
      return plainToInstance(SearchProductDTO, data, {
         excludeExtraneousValues: true,
      });
   }
}
