import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICategory  extends Document {
   name : string;
   totalProduct : number;
}
const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    totalProduct: { type: Number, default: 0 },
});
export default mongoose.model<ICategory>("Category", CategorySchema);
