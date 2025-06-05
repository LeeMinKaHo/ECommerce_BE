import { Server, Socket } from "socket.io";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Container } from "typedi";
import { ChatService } from "./chat.service";
import { Config } from "../shared/config";
import { UserService } from "../user/user.service";

export function setupChatGateway(io: Server) {
   const chatService = new ChatService();
   const userService = Container.get(UserService);
   const config = Container.get(Config);

   // ✅ Middleware xác thực token
   io.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
         console.warn("❌ Không có token từ client");
         return next(new Error("Authentication error"));
      }

      try {
         const decoded = jwt.verify(token, config.accessTokenSecret) as JwtPayload;
         socket.data.user =await userService.findUser(decoded.userId);
        
         next();
      } catch (err) {
         console.error("❌ Token không hợp lệ:", err);
         next(new Error("Authentication error"));
      }
   });

   // ✅ Khi client kết nối
   io.on("connection", async (socket: Socket) => {
      const user = socket.data?.user;

      // Nếu là admin thì join vào phòng admin chờ
      if (user?.role === 0) {
         socket.join("admins");
         console.log(`Admin ${user._id} connected`);
      }

      // Khi user bắt đầu chat
      socket.on("user:startChat", () => {
         if (!user?._id) return;

         const roomId = `room_${user._id}`;
         socket.join(roomId);

         console.log(`User ${user._id} joined ${roomId}`);

         // Gửi cho admin biết có phòng mới
         io.to("admins").emit("admin:newChatRoom", roomId);
      });

      // Admin join phòng
      socket.on("admin:joinRoom", (roomId) => {
         socket.join(roomId);
         console.log(`Admin joined room ${roomId}`);
      });

      // User gửi tin nhắn
      socket.on("user:sendMessage", ({ roomId, message }) => {
         if (!roomId || !message) return;

         console.log(`User -> ${roomId}: ${message}`);

         io.to(roomId).emit("chat:message", {
            from: "user",
            message,
            timestamp: new Date().toISOString(),
         });
      });

      // Admin gửi tin nhắn
      socket.on("admin:sendMessage", ({ roomId, message }) => {
         if (!roomId || !message) return;

         console.log(`Admin -> ${roomId}: ${message}`);

         io.to(roomId).emit("chat:message", {
            from: "admin",
            message,
            timestamp: new Date().toISOString(),
         });
      });
   });
}
