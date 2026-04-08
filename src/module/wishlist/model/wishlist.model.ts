import mongoose, { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
}

const WishlistSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
}, { timestamps: true });

// Ensure a user can only wishlist a product once
WishlistSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model<IWishlist>("Wishlist", WishlistSchema);
