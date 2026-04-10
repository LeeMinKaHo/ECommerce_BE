import { Service } from "typedi";
import wishlistModel from "./model/wishlist.model";
import mongoose from "mongoose";

@Service()
export class WishlistRepository {
  async toggle(userId: string, productId: string) {
    const existing = await wishlistModel.findOne({ user: userId, product: productId });
    if (existing) {
      await wishlistModel.deleteOne({ _id: existing._id });
      return { action: "removed" };
    } else {
      await wishlistModel.create({ user: userId, product: productId });
      return { action: "added" };
    }
  }

  async findByUser(userId: string) {
    return wishlistModel.find({ user: userId }).populate("product");
  }

  async checkIsWishlisted(userId: string, productId: string) {
    const item = await wishlistModel.findOne({ user: userId, product: productId });
    return !!item;
  }
}
