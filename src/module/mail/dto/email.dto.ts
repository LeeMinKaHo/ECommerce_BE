import { Expose, plainToInstance } from "class-transformer";

export class EmailDTO {
   @Expose()
   email: string;
   @Expose()
   subject: string;
   @Expose()
   body: string;
   constructor(email: string, subject: string, body: string) {
      this.email = email;
      this.subject = subject;
      this.body = body;
   }
   static fromRequest(data: any) {
      return plainToInstance(EmailDTO, data, { excludeExtraneousValues: true });
   }
   static fromJobData(data: any) {
      return new EmailDTO(data.email, data.subject, data.body);
   }
   static toMailVerify(code : string , email : string){
      return new EmailDTO(email,"Xác nhận đăng ký tài khoản",`Your code :${code}`)
   }
}
