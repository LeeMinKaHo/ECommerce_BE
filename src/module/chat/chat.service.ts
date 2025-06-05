import { ChatModel, IChat } from "./chat.model";


export class ChatService {
   async saveMessage(senderId: string, senderName: string, content: string): Promise<IChat> {
      const message = new ChatModel({ senderId, senderName, content });
      return await message.save();
   }

   async getRecentMessages(limit = 20): Promise<IChat[]> {
      return await ChatModel.find().sort({ createdAt: -1 }).limit(limit).exec();
   }
}
