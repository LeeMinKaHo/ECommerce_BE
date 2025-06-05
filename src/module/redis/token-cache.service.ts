import { Inject, Service } from "typedi";
import { RedisService } from "./redis.service";
import { Keys, timeExpire } from "../shared/auth.shared";
import { PayLoad } from "../auth/auth.types";
@Service()
export class TokenCacheService {
   constructor(@Inject() private redisService: RedisService) {}
   async cacheAccessToken(email: string, accessToken: string) {
      await this.redisService.setKey(
         Keys.accessToken(email),
         accessToken,
         timeExpire.accessToken
      );
   }
   async cacheRefreshToken(email: string, refreshToken: string) {
      await this.redisService.setKey(
         Keys.refreshToken(email),
         refreshToken,
         timeExpire.refreshToken
      );
   }
   async deleteAccessToken(email: string) {
      return await this.redisService.deleteKey(Keys.accessToken(email));
   }
   async deleteRefreshToken(email: string) {
      return await this.redisService.deleteKey(Keys.refreshToken(email));
   }
}
