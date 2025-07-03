import mongoose, { Types } from "mongoose";
import { Inject, Service } from "typedi";
import "../product/model/size.model";
import { ProductService } from "../product/product.service";
import { UserService } from "../user/user.service";
import { CartModel } from "./cart.model";
import { AddCartDTO } from "./dto/add-cart.dto";
import { UpdateCartDTO } from "./dto/update-cart.dto";
import productModel from "../product/model/product.model";
@Service()
export class CartService {
   constructor(
      @Inject() private userService: UserService,
      @Inject() private productService: ProductService
   ) {}
   async addToCart(email: string, createCartDto: AddCartDTO) {
      const { productVariantId, quantity } = createCartDto;

      // 1. Tìm user
      const user = await this.userService.findUserByEmail(email);

      // 2. Kiểm tra variant có tồn tại không
      await this.productService.checkProductVariantExist(productVariantId);

      // 3. Tìm cart item hiện tại (nếu có)
      const existingCartItem = await CartModel.findOne({
         userId: user._id,
         productVariantId,
      });

      if (existingCartItem) {
         // 4. Nếu đã có thì cập nhật quantity
         existingCartItem.quantity += quantity;
         await existingCartItem.save();
      } else {
         // 5. Nếu chưa có thì tạo mới
         await CartModel.create({
            userId: user._id,
            productVariantId,
            quantity,
         });
      }
   }

   async getCart(email: string) {
      const { _id: userId } = await this.userService.findUserByEmail(email);
     

      const cartWithProducts = await CartModel.aggregate([
         {
            $match: { userId },
         },
         {
            $lookup: {
               from: "products",
               let: { variantId: "$productVariantId" },
               pipeline: [
                  { $unwind: "$variants" },
                  {
                     $match: {
                        $expr: { $eq: ["$variants._id", "$$variantId"] },
                     },
                  },
                  { $project: { price: 1, name: 1, variant: "$variants" } },
               ],
               as: "product",
            },
         },
         {
            $unwind: "$product",
         },
      ]);
      return cartWithProducts
   }

   async updateCartItem(email: string, updateCartDTO: UpdateCartDTO) {
      const { cartItemId, quantity } = updateCartDTO;

      const cartItem = await this.findCartItem(cartItemId);

      cartItem.quantity = quantity;
      await cartItem.save();
      return cartItem;
   }

   async removeCartItem(email: string, cartItemId: string) {
      return await CartModel.findByIdAndDelete(cartItemId);
   }

   async clearCart(email: string) {
      const { _id: userId } = await this.userService.findUserByEmail(email);
      return await CartModel.deleteMany({ userId: new Types.ObjectId(userId) });
   }
   async findCartItem(cartItemId: string) {
      const cartItem = await CartModel.findById(cartItemId);
      if (!cartItem) {
         throw new Error("Cart item not found");
      }
      return cartItem;
   }
   async getTotalPrice(email: string) {
      const cartItems = await this.getCart(email);
      let totalPrice = 0;

      for (const item of cartItems) {
         totalPrice += item.product.price * item.quantity;
      }

      return totalPrice;
   }
}
