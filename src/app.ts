import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import { UserRouter } from "./module/user/user.router";
import { connectMongoDB } from "./module/shared/database/connnection";
import cors from "cors";
import { QueueManager } from "./module/bullmq/queue-manager";
import { WorkManager } from "./module/bullmq/worker.service";
import { ProductRouter } from "./module/product/product.router";
import { ErrorCustom, handleError } from "./module/shared/error/error-custom";
import { ReviewRouter } from "./module/reviews/review.router";
import { Container } from "typedi";
import cartRouter from "./module/cart/cart.router";
import { requestLogger } from "./module/shared/middleware/request-log.middleware";
import path from "path";
import { InvoiceRouter } from "./module/invoice/invoice.router";
import { Server } from "socket.io";
import http from "http";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Config } from "./module/shared/config";
import { setupChatGateway } from "./module/chat/chat.gateway";
const app = express();
const PORT = 4000;
app.use(express.static(path.join(__dirname, "../public")));
connectMongoDB();
const server = http.createServer(app);
const io = new Server(server, {
   cors: {
      origin: "http://localhost:5173", // React FE
      methods: ["GET", "POST"],
     
   },
});
setupChatGateway(io);

app.use(express.json());
app.use(requestLogger);
// router
app.use(
   cors({
      origin: "http://localhost:5173",
      credentials: true, // nếu bạn cần gửi cookie / auth
   })
);
app.use("/users", Container.get(UserRouter).getRouter());
app.use("/products", Container.get(ProductRouter).getRouter());
app.use("/reviews", Container.get(ReviewRouter).getRouter());
app.use("/carts", cartRouter);
app.use("/invoices", Container.get(InvoiceRouter).getRouter());
// connect DB
// handle error
app.use((err, req, res, next) => {
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
