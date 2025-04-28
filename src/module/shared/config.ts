import dotenv from "dotenv";
import { Service } from "typedi";
dotenv.config();
@Service()
export class Config {
   public accessTokenSecret;
   public refreshTokenSecret;
   public email;
   public emailPass;
   constructor() {
      this.accessTokenSecret = process.env.accessTokenSecret || "LeKhoa123";
      this.refreshTokenSecret = process.env.refreshTokenSecret || "LeKhoa123";
      this.email = process.env.EMAIL || "leminhkhoa5241@gmail.com";
      this.emailPass = process.env.PASS || "bmvu wgyl pckz eimx";
   }
}
