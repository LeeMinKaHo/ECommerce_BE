import { Expose } from "class-transformer";
import { stringify } from "querystring";

export class AuthRes {
   @Expose()
   accessToken: string;
   @Expose()
   refreshToken: string;

   constructor(accessToken: string, refreshToken: string) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
   }

   getAccessToken() {
      return this.accessToken;
   }
   getRefreshToken() {
      return this.refreshToken;
   }
   toString() {
      return stringify({
         accessToken: this.accessToken,
         refreshToken: this.refreshToken,
      });
   }
}
