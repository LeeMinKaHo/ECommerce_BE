import { Schema, Types, model } from "mongoose";
import { IProduct } from "../product/model/product.model";
import { IInvoice } from "../invoice/model/invoice.model";
import { IUser } from "../user/model/user.model";

export interface IReview {
   star: number;
   headline: string;
   content: string;
   productId: Types.ObjectId | IProduct;
   invoiceId: Types.ObjectId | IInvoice;
   delete: boolean;
   userId: Types.ObjectId | IUser;
   likes: Types.ObjectId[];  // Danh sách userId đã like
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
      delete: { type: Boolean, default: false },
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      likes: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
      invoiceId: {
         type: Schema.Types.ObjectId,
         ref: "Invoice",
         required: true,
      },
   },
   {
      timestamps: true,
   }
);

export default model<IReview>("Review", reviewSchema);
