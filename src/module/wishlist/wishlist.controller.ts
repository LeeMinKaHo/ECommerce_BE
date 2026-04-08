import { Request, Response } from "express";
import { Inject, Service } from "typedi";
import { WishlistService } from "./wishlist.service";

@Service()
export class WishlistController {
  constructor(@Inject() private wishlistService: WishlistService) {}

  async toggle(req: Request, res: Response) {
    const { productId } = req.body;
    const email = (req as any).payload.email;
    const result = await this.wishlistService.toggleWishlist(email, productId);
    res.status(200).json({
      message: result.action === "added" ? "Added to wishlist" : "Removed from wishlist",
      data: result
    });
  }

  async getMyWishlist(req: Request, res: Response) {
    const email = (req as any).payload.email;
    const result = await this.wishlistService.getMyWishlist(email);
    res.status(200).json({
      data: result
    });
  }

  async checkStatus(req: Request, res: Response) {
    const { productId } = req.params;
    const email = (req as any).payload.email;
    const isWishlisted = await this.wishlistService.isProductWishlisted(email, productId);
    res.status(200).json({
      data: { isWishlisted }
    });
  }
}
