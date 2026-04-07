import { Schema, Types, model } from "mongoose";
import { IUser } from "../user/model/user.model";

// ✅ Enum các loại thông báo — dễ mở rộng sau này
export enum NotificationType {
   REVIEW_LIKED = "REVIEW_LIKED",
   // Thêm vào đây khi cần:
   // NEW_COMMENT = "NEW_COMMENT",
   // ORDER_SHIPPED = "ORDER_SHIPPED",
   // FLASH_SALE = "FLASH_SALE",
}

export interface INotification {
   recipientId: Types.ObjectId | IUser; // Người nhận thông báo
   senderId: Types.ObjectId | IUser;    // Người gửi hành động
   type: NotificationType;
   payload: Record<string, any>;        // Dữ liệu tùy theo loại thông báo
   isRead: boolean;
   createdAt?: Date;
   updatedAt?: Date;
}

const notificationSchema = new Schema<INotification>(
   {
      recipientId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
         index: true,
      },
      senderId: {
         type: Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      type: {
         type: String,
         enum: Object.values(NotificationType),
         required: true,
      },
      payload: {
         type: Schema.Types.Mixed,
         default: {},
      },
      isRead: {
         type: Boolean,
         default: false,
      },
   },
   {
      timestamps: true,
   }
);

export default model<INotification>("Notification", notificationSchema);
