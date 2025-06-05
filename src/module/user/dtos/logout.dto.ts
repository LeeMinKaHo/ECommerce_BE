import { plainToInstance } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class LogoutDTO {
   @IsString()
   @IsNotEmpty()
   email: string;

   static fromRequest(data: any) {
      return plainToInstance(LogoutDTO, data, {
         excludeExtraneousValues: true,
      });
   }
}
