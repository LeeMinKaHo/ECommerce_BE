import { Worker } from "bullmq";
import { Service } from "typedi";
import { emailWorker } from "./worker/email.worker";
@Service()
export class WorkManager {
   private worker;
   private workerList: { [key: string]: Worker } = {};

   async setupWorker() {
      const workers = [emailWorker];
      workers.forEach((worker) => {
         this.workerList[worker.name] = worker;
      });
   }
}
