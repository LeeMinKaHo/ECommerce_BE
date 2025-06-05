import { Queue } from "bullmq";
import { queueName } from "../shared/bullmq.share";
import { connectionRedis } from "../shared/database/connnection";
import { Service } from "typedi";
import { createBullBoard } from "bull-board";
import { BullMQAdapter } from "bull-board/bullMQAdapter";
@Service()
export class QueueManager {
   private queueList: { [key: string]: Queue } = {};
   constructor() {
      this.initQueue();
   }

   // Định nghĩa addJob với kiểu name chính xác
   async addJob(queueName: string, jobName: string, data: any) {
      const queue = this.getQueue(queueName);
      await queue.add(jobName, data);
   }
   async initQueue() {
      Object.keys(queueName).forEach((key) => {
         const name = queueName[key];
         this.queueList[name] = new Queue(name, {
            connection: connectionRedis,
         });
      });
   }
   createDashboard() {
      const queues = Object.keys(this.queueList) // Lấy danh sách key (email, notification, ...)
         .map((key) => new BullMQAdapter(this.queueList[key])); // Lấy queue tương ứng

      return createBullBoard(queues);
   }
   getQueue(name: string) {
      return this.queueList[name];
   }
}
