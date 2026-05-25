import Container from "typedi";
import { Worker } from "bullmq";
import { connectionRedis } from "../../shared/database/mongodb";
import { EmailService } from "../../mail/mail.service";
import { EmailDTO } from "../../mail/dto/email.dto";
import { queueName } from "../../shared/queue/bullmq.share";

const emailService = Container.get(EmailService);

export const emailWorker = new Worker(
   queueName.email,
   async (job) => {
      console.log(
         `📧 Processing email job: ${job.id}, sending to ${job.data.email}`
      );
      const emailDTO = EmailDTO.fromJobData(job.data);
      await emailService.sendEmail(emailDTO);
   },
   { connection: connectionRedis }
); 
