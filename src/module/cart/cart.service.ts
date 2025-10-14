import mongoose, { Types } from "mongoose";
import { Inject, Service } from "typedi";
import "../product/model/size.model";
import { ProductService } from "../product/product.service";
import { UserService } from "../user/user.service";
import { CartModel } from "./cart.model";
import { AddCartDTO } from "./dto/add-cart.dto";
import { UpdateCartDTO } from "./dto/update-cart.dto";
import productModel from "../product/model/product.model";
import { CartRepository } from "./cart.repository";
@Service()
export class CartService {
   constructor(
      @Inject() private userService: UserService,
      @Inject() private productService: ProductService,
      @Inject() private cartRepository: CartRepository
   ) {}
   async addToCart(email: string, createCartDto: AddCartDTO) {
      const {  productId, quantity , variantId} = createCartDto;

      // 1. Tìm user
      const user = await this.userService.findUserByEmail(email);
 
      // 2. Kiểm tra variant có tồn tại không
      const product = await this.productService.getProductAndVariant(productId, variantId);
      const { _id, name, variant , price } = product;
      const { color, size, imageUrl } = variant;
      console.log(product)
      console.log(price)
      // 3. Tìm cart item hiện tại (nếu có)
      const existingCartItem = await CartModel.findOne({
         userId: user._id,
         productId: new Types.ObjectId(productId),
         size,
         color,
      });

      if (existingCartItem) {
         // 4. Nếu đã có thì cập nhật quantity
         existingCartItem.quantity += quantity;
         await existingCartItem.save();
      } else {
         // 5. Nếu chưa có thì tạo mới
         await CartModel.create({
            userId: user._id,
            name,
            color,
            imageUrl,
            size,
            productId: new Types.ObjectId(productId),
            productVariantId: _id,
            price,
            quantity,
            variantId
         });
      }
      return await this.cartRepository.countByUserId(new Types.ObjectId(user._id));
   }

   async getCart(email: string) {
      const { _id: userId } = await this.userService.findUserByEmail(email);

      const cartItems = await CartModel.find({
         userId: new Types.ObjectId(userId),
      });
      console.log("cart:",cartItems);
      return cartItems;
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

   async clearCart(userId : string) {
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
         totalPrice += item.price * item.quantity;
      }

      return totalPrice;
   }
}
