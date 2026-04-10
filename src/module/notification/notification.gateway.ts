import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Container } from "typedi";
import { Config } from "../shared/config";
import { UserService } from "../user/user.service";
import { Service } from "typedi";

/**
 * ✅ NotificationGateway quản lý kết nối Socket.IO cho hệ thống thông báo.
 * Mỗi user sau khi xác thực sẽ join vào room riêng `user:<userId>`.
 * Server có thể gửi thông báo tới bất kỳ user nào thông qua room đó.
 */
@Service()
export class NotificationGateway {
    private io: Server;

    setServer(io: Server) {
        this.io = io;
        this.setupMiddleware();
        this.setupHandlers();
    }

    private setupMiddleware() {
        const config = Container.get(Config);
        const userService = Container.get(UserService);

        this.io.of("/notifications").use(async (socket: Socket, next) => {
            const token = socket.handshake.auth.token;
            if (!token) {
                console.warn("❌ [Notification] Không có token từ client");
                return next(new Error("Authentication error"));
            }
            try {
                const decoded = jwt.verify(token, config.accessTokenSecret) as JwtPayload;
                socket.data.user = await userService.findUser(decoded.userId);
                next();
            } catch (err) {
                console.error("❌ [Notification] Token không hợp lệ:", err);
                next(new Error("Authentication error"));
            }
        });
    }

    private setupHandlers() {
        this.io.of("/notifications").on("connection", (socket: Socket) => {
            const user = socket.data?.user;
            if (!user?._id) return;

            // Mỗi user join vào room riêng của mình
            const userRoom = `user:${user._id.toString()}`;
            socket.join(userRoom);
            console.log(`🔔 [Notification] User ${user._id} connected → ${userRoom}`);

            socket.on("disconnect", () => {
                console.log(`🔕 [Notification] User ${user._id} disconnected`);
            });
        });
    }

    /**
     * ✅ Gửi thông báo realtime tới một user cụ thể.
     * @param recipientId - ID của người nhận
     * @param notification - Dữ liệu thông báo để gửi xuống client
     */
    sendToUser(recipientId: string, notification: object) {
        const room = `user:${recipientId}`;
        this.io.of("/notifications").to(room).emit("notification:new", notification);
        console.log(`📤 [Notification] Sent to ${room}:`, notification);
    }
}
