import { Expose, plainToInstance } from "class-transformer";
import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
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

// Sub-DTO: 1 row trong bảng size guide
export class SizeGuideRowDTO {
   @Expose()
   @IsString()
   @IsNotEmpty()
   size: string;

   @Expose()
   @IsString()
   @IsOptional()
   chest?: string;

   @Expose()
   @IsString()
   @IsOptional()
   waist?: string;

   @Expose()
   @IsString()
   @IsOptional()
   hip?: string;

   @Expose()
   @IsString()
   @IsOptional()
   length?: string;

   @Expose()
   @IsString()
   @IsOptional()
   shoulder?: string;

   @Expose()
   @IsString()
   @IsOptional()
   sleeve?: string;

   @Expose()
   @IsString()
   @IsOptional()
   thigh?: string;

   @Expose()
   @IsString()
   @IsOptional()
   width?: string;
}

// Sub-DTO: toàn bộ size guide
export class SizeGuideDTO {
   @Expose()
   @IsIn(['tops', 'bottoms', 'accessories', 'custom'])
   type: 'tops' | 'bottoms' | 'accessories' | 'custom';

   @Expose()
   @IsIn(['cm', 'inch'])
   unit: 'cm' | 'inch';

   @Expose()
   @IsArray()
   @ValidateNested({ each: true })
   @Type(() => SizeGuideRowDTO)
   rows: SizeGuideRowDTO[];
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
   @IsOptional()
   @ValidateNested()
   @Type(() => SizeGuideDTO)
   sizeGuide?: SizeGuideDTO;

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