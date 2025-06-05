import { Expose, plainToInstance, Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class AddCartDTO {
    @Expose()
    @IsString()
    @IsNotEmpty()
    productId: string;
 
    @Expose()
    @IsString()
    @IsNotEmpty()
    color: string;
    @Expose()
    @IsString()
    @IsNotEmpty()
    sizeId: string;
    @Expose()
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Transform(({ value }) => value !== undefined ? Number(value) : 1) // Nếu không có thì gán 1
    quantity: number;
 
    static fromRequest(body: any) {
       return plainToInstance(AddCartDTO, body, {
          excludeExtraneousValues: true,
       });
    }
 }
 