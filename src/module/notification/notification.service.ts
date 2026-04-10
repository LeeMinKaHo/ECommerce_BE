import { Inject, Service } from "typedi";
import notificationModel, { INotification, NotificationType } from "./notification.model";
import { NotificationGateway } from "./notification.gateway";
import mongoose from "mongoose";

/**
 * ✅ Interface định nghĩa cấu trúc của một sự kiện thông báo.
 * Khi thêm loại thông báo mới, chỉ cần:
 *   1. Thêm enum vào NotificationType (notification.model.ts)
 *   2. Thêm handler vào NotificationHandlers (bên dưới)
 *   3. Gọi notificationService.notify(event) ở đúng chỗ
 */
export interface NotificationEvent {
    type: NotificationType;
    senderId: string;
    recipientId: string;
    payload: Record<string, any>;
}

/**
 * ✅ Map từng loại thông báo sang thông điệp hiển thị.
 * Thêm case khi có loại mới.
 */
const NotificationHandlers: Record<
    NotificationType,
    (event: NotificationEvent) => { message: string; icon: string }
> = {
    [NotificationType.REVIEW_LIKED]: (event) => ({
        message: `Ai đó đã thích đánh giá của bạn về sản phẩm "${event.payload.productName || ""}"`,
        icon: "👍",
    }),

    // ── Thêm loại mới vào đây ──
    // [NotificationType.NEW_COMMENT]: (event) => ({
    //    message: `${event.payload.senderName} đã bình luận về đánh giá của bạn`,
    //    icon: "💬",
    // }),
    // [NotificationType.ORDER_SHIPPED]: (event) => ({
    //    message: `Đơn hàng #${event.payload.orderId} của bạn đã được giao`,
    //    icon: "📦",
    // }),
};

@Service()
export class NotificationService {
    constructor(@Inject() private notificationGateway: NotificationGateway) { }

    /**
     * ✅ Hàm trung tâm để tạo + gửi thông báo realtime.
     * Chỉ cần gọi hàm này với đúng NotificationEvent.
     */
    async notify(event: NotificationEvent): Promise<void> {
        const handler = NotificationHandlers[event.type];
        if (!handler) {
            console.warn(`⚠️ [Notification] Không có handler cho loại: ${event.type}`);
            return;
        }

        const { message, icon } = handler(event);

        // Lưu thông báo vào DB
        const notification = new notificationModel({
            recipientId: new mongoose.Types.ObjectId(event.recipientId),
            senderId: new mongoose.Types.ObjectId(event.senderId),
            type: event.type,
            payload: event.payload,
            isRead: false,
        });
        await notification.save();

        // Gửi realtime qua Socket.IO
        this.notificationGateway.sendToUser(event.recipientId, {
            _id: notification._id,
            type: event.type,
            message,
            icon,
            payload: event.payload,
            isRead: false,
            createdAt: notification.createdAt,
        });
    }

    /**
     * ✅ Lấy danh sách thông báo của user (có phân trang)
     */
    async getNotifications(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total] = await Promise.all([
            notificationModel
                .find({ recipientId: new mongoose.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("senderId", "fullName avatar email"),
            notificationModel.countDocuments({
                recipientId: new mongoose.Types.ObjectId(userId),
            }),
        ]);
        return { notifications, total, page, limit };
    }

    /**
     * ✅ Đánh dấu tất cả thông báo của user là đã đọc
     */
    async markAllAsRead(userId: string) {
        await notificationModel.updateMany(
            { recipientId: new mongoose.Types.ObjectId(userId), isRead: false },
            { $set: { isRead: true } }
        );
    }

    /**
     * ✅ Đánh dấu một thông báo là đã đọc
     */
    async markAsRead(notificationId: string, userId: string) {
        await notificationModel.updateOne(
            {
                _id: new mongoose.Types.ObjectId(notificationId),
                recipientId: new mongoose.Types.ObjectId(userId),
            },
            { $set: { isRead: true } }
        );
    }

    /**
     * ✅ Đếm số thông báo chưa đọc
     */
    async countUnread(userId: string): Promise<number> {
        return notificationModel.countDocuments({
            recipientId: new mongoose.Types.ObjectId(userId),
            isRead: false,
        });
    }
}
