import { Inject, Service } from "typedi";
import { WishlistRepository } from "./wishlist.repository";
import { ProductRepository } from "../product/product.repository";
import { Error } from "../shared/errors/error-custom";
import { UserService } from "../user/user.service";

@Service()
export class WishlistService {
  constructor(
    @Inject() private wishlistRepo: WishlistRepository,
    @Inject() private productRepo: ProductRepository,
    @Inject() private userService: UserService
  ) {}

  async toggleWishlist(email: string, productId: string) {
    const user = await this.userService.findUserByEmail(email);
    
    // Check if product exists
    const product = await this.productRepo.findByIdOrFail(productId);
    if (!product) throw Error.ProductNotFound;

    return this.wishlistRepo.toggle(user._id.toString(), productId);
  }

  async getMyWishlist(email: string) {
    const user = await this.userService.findUserByEmail(email);
    return this.wishlistRepo.findByUser(user._id.toString());
  }

  async isProductWishlisted(email: string, productId: string) {
    const user = await this.userService.findUserByEmail(email);
    return this.wishlistRepo.checkIsWishlisted(user._id.toString(), productId);
  }
}
