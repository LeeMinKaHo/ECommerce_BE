import { Request } from "express";

export class PayLoad {
   userId: string;
  

   constructor(userId: string) {
      this.userId = userId;
   }
}

export interface AuthRequest extends Request {
   payload?: PayLoad; // Thêm thuộc tính mới vào request
 }
 