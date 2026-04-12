import { Worker } from "bullmq";
import { Service } from "typedi";
import { emailWorker } from "./worker/email.worker";
import { aiWorker } from "./worker/ai.worker";
@Service()
export class WorkManager {
   private worker;
   private workerList: { [key: string]: Worker } = {};

   async setupWorker() {
      const workers = [emailWorker, aiWorker];
      workers.forEach((worker) => {
         this.workerList[worker.name] = worker;
      });
   }
}
