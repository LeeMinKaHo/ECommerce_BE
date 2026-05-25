import dotenv from "dotenv";
import { Service } from "typedi";
dotenv.config();
@Service()
export class Config {
   public accessTokenSecret: string;
   public refreshTokenSecret: string;
   public email: string | undefined;
   public emailPass: string | undefined;
   constructor() {
      const isProd = process.env.NODE_ENV === "production";

      const access = process.env.ACCESS_TOKEN_SECRET ?? process.env.accessTokenSecret;
      const refresh =
         process.env.REFRESH_TOKEN_SECRET ?? process.env.refreshTokenSecret;

      if (isProd && (!access || !refresh)) {
         throw new Error(
            "Missing JWT secrets. Set ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET."
         );
      }

      // Safe dev fallback (DO NOT use in production)
      this.accessTokenSecret = access ?? "dev-access-secret";
      this.refreshTokenSecret = refresh ?? "dev-refresh-secret";

      this.email = process.env.EMAIL;
      this.emailPass = process.env.PASS;
   }
}
