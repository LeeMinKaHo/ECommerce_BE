import { Expose } from "class-transformer"
import { IsNumber, IsOptional } from "class-validator"

export class UpdateProductDTO{
    @Expose()
    @IsNumber()
    @IsOptional()
    price : number
    @Expose()
    @IsNumber()
    @IsOptional()
    quanlity : number
}