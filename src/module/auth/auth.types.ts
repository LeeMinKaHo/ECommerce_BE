import { Request } from "express";
import mongoose, { ObjectId } from "mongoose";
import { userRole } from "../user/user.types";

export class PayLoad {
   email: string;
   role : userRole
   jti?: string

   constructor(email: string , role: userRole, jti?: string  ) {
      this.email = email;
      this.role = role;
      this.jti = jti;
   }
}

export interface AuthRequest extends Request {
   payload?: PayLoad // Thêm thuộc tính mới vào request
 }
 