import { Inject, Service } from "typedi";
import { CartModel } from "./cart.model";
import mongoose, { Types } from "mongoose";
import { AddCartDTO } from "./dto/add-cart.dto";
import productVariantModel from "../product/model/product-variant.model";
import { CartResDTO } from "./dto/cart-res.dto";
import { UpdateCartDTO } from "./dto/update-cart.dto";
import "../product/model/size.model";
import { UserService } from "../user/user.service";
@Service()
export class CartService {
   constructor(@Inject() private userService: UserService) {}
   async addToCart(email: string, createCartDto: AddCartDTO) {
      const { _id: userId } = await this.userService.findUserByEmail(email);
      const { color, productId, sizeId, quantity } = createCartDto;

      const variant = await productVariantModel.findOne({
         color,
         productId,
         sizeId,
      });
      const { _id: productVariantId } = variant;
      if (!variant) {
         throw new Error("Không tìm thấy biến thể sản phẩm phù hợp.");
      }

      const existingItem = await CartModel.findOne({
         userId,
         productVariantId,
      });

      if (existingItem) {
         existingItem.quantity += quantity;
         await existingItem.save();
      } else {
         const newItem = new CartModel({
            userId,
            productVariantId,
            quantity,
         });
         await newItem.save();
      }

      // 👉 Đếm tổng số sản phẩm khác nhau trong giỏ hàng (số dòng)
      const totalItems = await CartModel.countDocuments({
         userId,
      });

      return {
         message: "Thêm sản phẩm vào giỏ thành công",
         totalItems,
      };
   }

   async getCart(email: string) {
      const { _id: userId } = await this.userService.findUserByEmail(email);
      const cartItems = await CartModel.find({
         userId,
      })
         .populate({
            path: "productVariantId",
            model: "ProductVariant",
            populate: [
               {
                  path: "productId",
                  model: "Product",
               },
               {
                  path: "sizeId", // đây là cái thêm mới
                  model: "Size",
               },
            ],
         })
         .lean();
      console.log(cartItems);
      return cartItems;
   }

   async updateCartItem(email: string, updateCartDTO: UpdateCartDTO) {
      const { cartItemId, quantity } = updateCartDTO;
      const item = await CartModel.findById(cartItemId);

      if (!item) {
         throw new Error("Cart item not found");
      }

      item.quantity = quantity;
      await item.save();
      return item;
   }

   async removeCartItem(email: string, cartItemId: string) {
      return await CartModel.findByIdAndDelete(cartItemId);
   }

   async clearCart(email: string) {
      const { _id: userId } = await this.userService.findUserByEmail(email);
      return await CartModel.deleteMany({ userId: new Types.ObjectId(userId) });
   }
}
