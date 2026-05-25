import { Expose, plainToInstance } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

// Sub-DTO: mỗi size bên trong 1 màu
export class SizeEntryDTO {
   @Expose()
   @IsString()
   @IsNotEmpty()
   size: string;

   @Expose()
   @IsNumber()
   @IsNotEmpty()
   quantity: number;
}

// Sub-DTO: 1 nhóm màu (ảnh lưu 1 lần, nhiều size bên trong)
export class ColorVariantDTO {
   @Expose()
   @IsString()
   @IsNotEmpty()
   color: string;

   @Expose()
   @IsArray()
   imageUrls: string[];  // Nhiều ảnh cho 1 màu

   @Expose()
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => SizeEntryDTO)
   sizes: SizeEntryDTO[];
}

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
   price: number;

   @Expose()
   @IsString()
   @IsOptional()
   defaultImage?: string;

   @Expose()
   @IsString()
   @IsNotEmpty()
   createBy: string;

   @Expose()
   @IsString()
   categoryId: string;

   @Expose()
   @IsArray()
   @IsString({ each: true })
   @IsOptional()
   details?: string[];

   @Expose()
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => ColorVariantDTO)
   colorVariants: ColorVariantDTO[];

   static fromRequest(data: any) {
      return plainToInstance(CreateProductDTO, data, {
         excludeExtraneousValues: true,
      });
   }
}