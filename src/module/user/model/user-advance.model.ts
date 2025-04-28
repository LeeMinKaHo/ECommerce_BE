import mongoose, { Schema } from "mongoose";

export interface UserAdvance extends Document {
   avatar: string;
   phone: string;
   fullName: string;
   address: string;
   user: mongoose.Types.ObjectId;
}

const UserAdvanceSchema = new Schema({
   avatar: { type: String },
   phone: { type: String },
   fulllName: { type: String },
   address: { type: String },
   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model<UserAdvance>("UserAdvance", UserAdvanceSchema);
