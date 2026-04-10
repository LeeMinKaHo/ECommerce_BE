import { Expose } from "class-transformer"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class UpdateProductDTO {
    @Expose()
    @IsString()
    @IsOptional()
    name?: string;

    @Expose()
    @IsString()
    @IsOptional()
    description?: string;

    @Expose()
    @IsNumber()
    @IsOptional()
    price?: number;

    @Expose()
    @IsNumber()
    @IsOptional()
    quantity?: number;

    @Expose()
    @IsString()
    @IsOptional()
    defaultImage?: string;
}