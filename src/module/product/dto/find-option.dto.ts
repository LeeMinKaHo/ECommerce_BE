import { Expose, plainToInstance, Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { Request } from "express";
export enum SortOption {
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
   static fromRequest(req: Request) {
    
      return plainToInstance(FindOptionDTO, req.query, {
         excludeExtraneousValues: true,
      });
   }
}
