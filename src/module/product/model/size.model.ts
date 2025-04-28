import mongoose, { Schema, model, Document } from "mongoose";

// Interface
export interface ISize extends Document {
  name: string;
}

// Schema
const sizeSchema: Schema<ISize> = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

// Model (nếu bạn cần tạo luôn)
export default mongoose.model<ISize>("Size" , sizeSchema)
