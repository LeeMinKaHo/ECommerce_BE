import { QueueManager } from "src/module/bullmq/queue-manager";
import { Container } from "typedi";
import { WorkManager } from "src/module/bullmq/worker.service";
export const setupJobs = (app: any) => {
  const queueManager = Container.get(QueueManager);
  const { router } = queueManager.createDashboard();
  app.use("/admin/queues", router);

  const workerManager = Container.get(WorkManager);
  workerManager.setupWorker();
};