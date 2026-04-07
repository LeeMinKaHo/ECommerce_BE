import { Types } from "mongoose";
import { Inject, Service } from "typedi";
import { ProductService } from "../product/product.service";
import { UserService } from "../user/user.service";
import { CartRepository } from "./cart.repository";
import { AddCartDTO } from "./dto/add-cart.dto";
import { UpdateCartDTO } from "./dto/update-cart.dto";
import { Error } from "../shared/error/error-custom";
import { ICartItem } from "./cart.model";

@Service()
export class CartService {
   constructor(
      @Inject() private userService: UserService,
      @Inject() private productService: ProductService,
      @Inject() private cartRepository: CartRepository
   ) {}

   /**
    * Thêm sản phẩm vào giỏ hàng
    */
   async addToCart(email: string, createCartDto: AddCartDTO) {
      const { productId, quantity, variantId } = createCartDto;

      // 1. Lấy User
      const user = await this.userService.findUserByEmail(email);
      if (!user) throw Error.UserNotFound;

      // 2. Lấy thông tin Product & Variant (Để đảm bảo giá và thông tin luôn mới nhất)
      const product = await this.productService.getProductAndVariant(productId, variantId);
      if (!product) throw Error.ProductNotFound;

      const { variant, price, name } = product;
      const { color, size, imageUrl } = variant;

      // 3. Sử dụng upsert mang tính nguyên tử của Repository
      await this.cartRepository.upsertCartItem(
         new Types.ObjectId(user._id),
         new Types.ObjectId(productId),
         variantId,
         {
            name,
            color,
            size,
            imageUrl,
            price,
            quantity
         }
      );

      // Trả về số lượng loại sản phẩm trong giỏ hàng để cập nhật Badge ở FE
      return await this.cartRepository.countByUserId(new Types.ObjectId(user._id));
   }

   /**
    * Lấy danh sách giỏ hàng
    */
   async getCart(email: string) {
      const user = await this.userService.findUserByEmail(email);
      if (!user) throw Error.UserNotFound;

      return await this.cartRepository.findByUserId(new Types.ObjectId(user._id));
   }

   /**
    * Cập nhật số lượng của một item
    */
   async updateCartItem(email: string, updateCartDTO: UpdateCartDTO) {
      const { cartItemId, quantity } = updateCartDTO;

      const cartItem = await this.cartRepository.findById(cartItemId);
      if (!cartItem) throw Error.BadRequest; // Hoặc một lỗi CartItemNotFound tùy biến

      return await this.cartRepository.updateQuantity(cartItemId, quantity);
   }

   /**
    * Xóa item khỏi giỏ hàng
    */
   async removeCartItem(email: string, cartItemId: string) {
      return await this.cartRepository.delete(cartItemId);
   }

   /**
    * Xóa sạch giỏ hàng (Sau khi thanh toán thành công)
    */
   async clearCart(userId: string) {
      return await this.cartRepository.deleteByUserId(new Types.ObjectId(userId));
   }

   /**
    * Lấy tổng tiền giỏ hàng (Sử dụng Aggregation tính toán ở DB layer)
    */
   async getTotalPrice(email: string) {
      const user = await this.userService.findUserByEmail(email);
      if (!user) throw Error.UserNotFound;

      return await this.cartRepository.calculateTotalPrice(new Types.ObjectId(user._id));
   }

   /**
    * Tìm kiếm item trong giỏ hàng (Internal helper)
    */
   private async findCartItem(cartItemId: string): Promise<ICartItem> {
      const cartItem = await this.cartRepository.findById(cartItemId);
      if (!cartItem) {
          throw Error.BadRequest;
      }
      return cartItem;
   }
}

