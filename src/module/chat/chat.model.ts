import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
   senderId: string;
   senderName: string;
   content: string;
   createdAt: Date;
}

const ChatSchema: Schema = new Schema(
   {
      senderId: { type: String, required: true },
      senderName: { type: String, required: true },
      content: { type: String, required: true },
   },
   { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);
