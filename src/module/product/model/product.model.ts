import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
   name: string;
   description: string;
   quanlity: number;
   quanlitySold: number;
   price: number;
   createBy: mongoose.Types.ObjectId;
   isDeleted : boolean
}

const ProductSchema: Schema = new Schema({
   name: { type: String, required: true },
   description: { type: String, required: true },
   quanlity: { type: Number, required: true , default : 0},
   quanlitySold: { type: Number, required: true  , default:0},
   price: { type: Number, required: true , min:0 }, // dùng Number, không phải Double
   createBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   isDeleted : {type : Boolean , default : false}
});
export default mongoose.model<IProduct>("Product", ProductSchema);