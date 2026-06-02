import { Expose, plainToInstance, Type, Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Request } from "express";

export enum SortOption {
   Latest = 0,
   Price_Asc = 1,
   Price_Desc = 2,
   Rating_Asc = 3,
   Rating_Desc = 4,
}

export class FindOptionDTO { 
   @IsOptional()
   @Expose()
   categoryId: string;

   @IsNumber()
   @Type(() => Number)
   @IsOptional()
   @Expose()
   minPrice: number;

   @IsNumber()
   @Type(() => Number)
   @IsOptional()
   @Expose()
   maxPrice: number;

   @IsEnum(SortOption)
   @Type(() => Number)
   @IsOptional()
   @Expose()
   sort: number;

   @IsOptional()
   @Expose()
   name: string;

   @IsNumber()
   @Type(() => Number)
   @IsOptional()
   @Expose()
   minRating: number;

   @IsOptional()
   @Transform(({ value }) => value === 'true' || value === true)
   @Expose()
   inStock: boolean;

   static fromRequest(req: Request) {
      return plainToInstance(FindOptionDTO, req.query, {
         excludeExtraneousValues: true,
      });
   }
}
