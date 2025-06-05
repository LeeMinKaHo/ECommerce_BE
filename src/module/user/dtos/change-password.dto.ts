import { Expose, plainToInstance } from "class-transformer";

export class ChangePassworDTO {
   @Expose()
   email: string;
   @Expose()
   password: string;
   @Expose()
   newPassword: string;
   static fromRequest(data: any) {
      return plainToInstance(ChangePassworDTO, data, {
         excludeExtraneousValues: true,
      });
   }
}
