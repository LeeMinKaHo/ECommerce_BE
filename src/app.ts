import "reflect-metadata";
import express from "express";
import Container from "typedi";
import { UserRouter } from "./module/user/user.router";
import { connectMongoDB } from "./module/database/connnection";
import cors from "cors";
import { QueueManager } from "./module/bullmq/queue-manager";
import { WorkManager } from "./module/bullmq/worker.service";
import { ProductRouter } from "./module/product/product.router";
import { handleError } from "./module/shared/error/error-custom";
const app = express();
const PORT = 4000;
app.use(express.json());
// router
app.use(
   cors({
      origin: "http://localhost:5173",
      credentials: true, // nếu bạn cần gửi cookie / auth
   })
);
app.use("/users", Container.get(UserRouter).getRouter());
app.use("/products", Container.get(ProductRouter).getRouter());
// connect DB
connectMongoDB();

// handle error
app.use((err, req, res, next) => {
   handleError(err, res);
});

const queueManager = Container.get(QueueManager);
const { router } = queueManager.createDashboard();
app.use('/admin/queues', router);
const workerManager = Container.get(WorkManager);
workerManager.setupWorker();

app.listen(PORT, () => {
   console.log("Server is running at localhost:/", PORT);
});
