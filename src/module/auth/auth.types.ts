import { Request } from "express";
import mongoose, { ObjectId } from "mongoose";
import { userRole } from "../user/user.types";

export class PayLoad {
   email: string;
   role : userRole

   constructor(email: string , role: userRole  ) {
      this.email = email;
      this.role = role;
   }
}

export interface AuthRequest extends Request {
   payload?: PayLoad // Thêm thuộc tính mới vào request
 }
 