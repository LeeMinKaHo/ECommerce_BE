import mongoose, { Document, Schema } from "mongoose";
import { userRole } from "../user.types";


export interface IUser extends Document {
   _id:string
   email: string;
   password: string;
   name: string;
   isActive: boolean;
   isDeleted: boolean;
   isBanned: boolean;
   role: number;
}

const UserSchema: Schema = new Schema({
   email: {
      type: String,
      required: true,
      match: /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/,
   },
   password: { type: String, required: true, minlength: 6 },
   name: { type: String, required: true },
   isActive: { type: Boolean, default: false },
   isDeleted: { type: Boolean, default: false },
   isBanned: { type: Boolean, default: false },
   role: { type: Number, enum: [userRole.User, userRole.Admin], default: userRole.User },
});
export default mongoose.model<IUser>("User", UserSchema);
