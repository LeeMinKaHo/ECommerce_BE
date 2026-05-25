import { Expose, plainToInstance, Transform } from "class-transformer";
import { IUser } from "../model/user.model";

export class LoginRes {
   @Expose()
   _id: string;
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
   // refresh token is now set as httpOnly cookie (not returned in JSON)
   static fromLoginRes(data: {
      user: IUser;
      access: string;
   }) {
      return plainToInstance(
         LoginRes,
         {
            ...data.user,
            access: data.access,
         },
         { excludeExtraneousValues: true }
      );
   }
}
