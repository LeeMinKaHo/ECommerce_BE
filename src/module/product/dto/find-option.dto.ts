import { plainToInstance, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Request } from "express";
export enum SortOption {
   Price_Asc = 1,
   Price_Desc = 2,
   Rating_Asc = 3,
   Rating_Desc = 4,
}

export class FindOptionDTO {
   @IsNumber()
   @Type(() => Number)
   @IsOptional()
   categoryId: number;
   @IsNumber()
   @Type(() => Number)
   @IsOptional()
   minPrice: number;

   @IsNumber()
   @Type(() => Number)
   @IsOptional()
   maxPrice: number;
   @IsEnum(SortOption)
   @Type(() => Number)
   @IsOptional()
   sort: number;
   static fromRequest(req: Request) {
      return plainToInstance(FindOptionDTO, req.query);
   }
}
