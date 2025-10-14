import { Types } from "mongoose";
import { Service } from "typedi";
import { CartModel } from "./cart.model";

@Service()
export class CartRepository {
   async findByUserId(userId: Types.ObjectId) {
      return await CartModel.find({ userId });
   }

   async findOne(condition: any) {
      return await CartModel.findOne(condition);
   }

   async create(cartItem: any) {
      return await CartModel.create(cartItem);
   }

   async updateQuantity(cartItemId: string, quantity: number) {
      return await CartModel.findByIdAndUpdate(cartItemId, { quantity });
   }

   async delete(cartItemId: string) {
      return await CartModel.findByIdAndDelete(cartItemId);
   }

   async deleteByUserId(userId: Types.ObjectId) {
      return await CartModel.deleteMany({ userId });
   }

   async findById(cartItemId: string) {
      return await CartModel.findById(cartItemId);
   }
   async countByUserId(userId: Types.ObjectId) {
      return await CartModel.countDocuments({ userId });
   }
}