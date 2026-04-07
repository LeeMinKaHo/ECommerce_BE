import { Types } from "mongoose";
import { Service } from "typedi";
import { CartModel, ICartItem } from "./cart.model";

@Service()
export class CartRepository {
   async findByUserId(userId: Types.ObjectId): Promise<ICartItem[]> {
      return await CartModel.find({ userId });
   }

   async findOne(condition: any): Promise<ICartItem | null> {
      return await CartModel.findOne(condition);
   }

   async findById(cartItemId: string): Promise<ICartItem | null> {
      return await CartModel.findById(cartItemId);
   }

   /**
    * Cập nhật hoặc thêm mới item vào giỏ hàng một cách atomical (atomic update)
    */
   async upsertCartItem(
      userId: Types.ObjectId,
      productId: Types.ObjectId,
      variantId: string,
      data: Partial<ICartItem>
   ) {
      return await CartModel.findOneAndUpdate(
         { userId, productId, variantId },
         { 
            $inc: { quantity: data.quantity }, // Nguyên tử: tăng số lượng
            $set: { 
               name: data.name,
               color: data.color,
               size: data.size,
               imageUrl: data.imageUrl,
               price: data.price 
            } 
         },
         { upsert: true, new: true }
      );
   }

   async updateQuantity(cartItemId: string, quantity: number) {
      return await CartModel.findByIdAndUpdate(
         cartItemId,
         { quantity },
         { new: true }
      );
   }

   async delete(cartItemId: string) {
      return await CartModel.findByIdAndDelete(cartItemId);
   }

   async deleteByUserId(userId: Types.ObjectId) {
      return await CartModel.deleteMany({ userId });
   }

   async countByUserId(userId: Types.ObjectId): Promise<number> {
      return await CartModel.countDocuments({ userId });
   }

   /**
    * Tính tổng tiền bằng Aggregation Framework (Chuyên nghiệp hơn)
    */
   async calculateTotalPrice(userId: Types.ObjectId): Promise<number> {
      const result = await CartModel.aggregate([
         { $match: { userId } },
         {
            $group: {
               _id: null,
               total: { $sum: { $multiply: ["$price", "$quantity"] } },
            },
         },
      ]);
      return result.length > 0 ? result[0].total : 0;
   }
}