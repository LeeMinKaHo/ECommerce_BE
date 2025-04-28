import bcrypt from "bcrypt";
import mongoose from "mongoose";
export async function hashPassword(password: string) {
   const saltRounds = 10;
   const salt = await bcrypt.genSalt(saltRounds);
   const hash = await bcrypt.hash(password, salt);
   console.log("Mật khẩu đã mã hóa:", hash);
   return hash;
}
export async function comparePassword(
   password: string,
   hash: string
): Promise<boolean> {
   return await bcrypt.compare(password, hash);
}
export async function initTransaction<T>(
   callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
   const session = await mongoose.startSession();
   session.startTransaction();
   try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
   } catch (error) {
      console.error("Transaction failed:", error);
      await session.abortTransaction();
      throw error;
   } finally {
      session.endSession();
   }
}

export class CodeGenerator {
    static generateVerificationCode(): string {
       return Math.floor(1000 + Math.random() * 9000).toString(); // Tạo số ngẫu nhiên 4 chữ số
    }
 }