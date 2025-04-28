import { Expose, plainToInstance } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginDTO {
   @Expose()
   @IsEmail()
   @IsNotEmpty()
   @IsString()
   email: string;
   @Expose()
   @MinLength(6)
   @IsNotEmpty()
   @IsString()
   password: string;
   static fromRequest(data: any) {
      return plainToInstance(LoginDTO, data, { excludeExtraneousValues: true });
   }
}
