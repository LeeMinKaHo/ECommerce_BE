import nodemailer from "nodemailer";
import { Inject, Service } from "typedi";

import { Config } from "../shared/config";
import { EmailDTO } from "./dto/email.dto";

@Service()
export class EmailService {
   private transporter;

   constructor(@Inject() private config: Config) {
      this.transporter = nodemailer.createTransport({
         service: "gmail",
         auth: {
            user: config.email,
            pass: config.emailPass,
         },
      });
   }

   async sendEmail(emailDTO: EmailDTO) {
      try {
         await this.transporter.sendMail({
            from: `"MyApp" <${this.config.email}>`,
            to: emailDTO.email,
            subject: emailDTO.subject,
            text: emailDTO.body,
         });
         console.log(`📧 Email sent to ${emailDTO.email}`);
      } catch (error) {
         console.error(`❌ Failed to send email to ${emailDTO.email}:`, error);
      }
   }
}
