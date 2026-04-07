import cors from "cors";
import express from "express";
import http from "http";
import path from "path";
import "reflect-metadata";
import { Server } from "socket.io";
import { Container } from "typedi";
import { QueueManager } from "./module/bullmq/queue-manager";
import { WorkManager } from "./module/bullmq/worker.service";
import cartRouter from "./module/cart/cart.router";
import { setupChatGateway } from "./module/chat/chat.gateway";
import { InvoiceRouter } from "./module/invoice/invoice.router";
import { ProductRouter } from "./module/product/product.router";
import { ReviewRouter } from "./module/reviews/review.router";
import { connectMongoDB } from "./module/shared/database/connnection";
import { handleError } from "./module/shared/error/error-custom";
import { requestLogger } from "./module/shared/middleware/request-log.middleware";
import { UserRouter } from "./module/user/user.router";
import uploadRoutes from "./module/upload/upload.route";
import { ReportRouter } from "./module/report/report.router";
import { NotificationGateway } from "./module/notification/notification.gateway";
import { NotificationRouter } from "./module/notification/notification.router";

const app = express();
const PORT = 4000;
app.use(express.static(path.join(__dirname, "../public")));
connectMongoDB();
const server = http.createServer(app);
const io = new Server(server, {
   cors: {
      origin: "http://localhost:5173", // React FE
      methods: ["GET", "POST", "PATCH"],
   },
});

// ✅ Setup gateways
setupChatGateway(io);
const notificationGateway = Container.get(NotificationGateway);
notificationGateway.setServer(io);

app.use(express.json());
app.use(requestLogger);
// router
app.use(
   cors({
      origin: "http://localhost:5173",
      credentials: true,
   })
);
app.use("/users", Container.get(UserRouter).getRouter());
app.use("/products", Container.get(ProductRouter).getRouter());
app.use("/reviews", Container.get(ReviewRouter).getRouter());
app.use("/carts", cartRouter);
app.use("/invoices", Container.get(InvoiceRouter).getRouter());
app.use("/api/upload", uploadRoutes);
app.use("/admin", Container.get(ReportRouter).getRouter());
app.use("/notifications", Container.get(NotificationRouter).getRouter());

// handle error
app.use((err: any, req: any, res: any, next: any) => {
   handleError(err, res);
});

const queueManager = Container.get(QueueManager);
const { router } = queueManager.createDashboard();
app.use("/admin/queues", router);
const workerManager = Container.get(WorkManager);
workerManager.setupWorker();

server.listen(PORT, () => {
   console.log("Server is running at http://localhost:" + PORT);
});
