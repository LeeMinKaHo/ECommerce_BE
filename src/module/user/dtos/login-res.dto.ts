import { Expose, plainToInstance, Transform } from "class-transformer";
import { IUser } from "../model/user.model";

export class LoginRes {
   @Expose()
   email: string;
   @Expose()
   name: string;
   @Expose()
   @Transform(({ value }) => {
      return value === 1 ? "admin" : "user";
   })
   role: string;
   @Expose()
   access: string;
   @Expose()
   refresh: string;
   static fromLoginRes(data: {
      user: IUser;
      access: string;
      refresh: string;
   }) {
      return plainToInstance(
         LoginRes,
         {
            ...data.user,
            access: data.access,
            refresh: data.refresh,
         },
         { excludeExtraneousValues: true }
      );
   }
}
