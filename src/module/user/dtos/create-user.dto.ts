import { Expose, plainToInstance } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserDTO {
   @Expose()
   @IsString()
   @IsNotEmpty()
   email: string;
   @Expose()
   @IsString()
   @IsNotEmpty()
   password: string;
   @Expose()
   @IsString()
   @IsNotEmpty()
   name: string;
   @Expose()
   @IsOptional() // <- nếu không bắt buộc
   @IsNumber()
   role?: number;
   static fromRequest(data: any) {
      return plainToInstance(CreateUserDTO, data, {
         excludeExtraneousValues: true,
      });
   }
}
