import { Schema, Types, model } from "mongoose";

export interface IReview {
   star: number;
   headline: string;
   content: string;
   productId: Types.ObjectId;
   userId: Types.ObjectId;
}

const reviewSchema = new Schema<IReview>(
   {
      star: { type: Number, required: true },
      headline: { type: String, required: true },
      content: { type: String, required: true },
      productId: {
         type: Schema.Types.ObjectId,
         ref: "Product",
         required: true,
      },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
   },
   {
      timestamps: true,
   }
);

export default model<IReview>("Review", reviewSchema);
