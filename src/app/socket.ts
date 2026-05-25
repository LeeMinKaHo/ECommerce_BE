import { Server } from "socket.io";
import { setupChatGateway } from "src/module/chat/chat.gateway";
import { NotificationGateway } from "src/module/notification/notification.gateway";
import { Container } from "typedi";

export const setupSocket = (server: any) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  setupChatGateway(io);

  const notificationGateway = Container.get(NotificationGateway);
  notificationGateway.setServer(io);

  return io;
};