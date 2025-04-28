import { Service } from "typedi";
import { RedisService } from "./redis.service";
import { Keys } from "../shared/auth.shared";

@Service()
export class TokenCacheService {
   private accessTokenTTL = 3600; // 1 tiếng
   private refreshTokenTTL = 86400; // 1 ngày

   constructor(private readonly redisService: RedisService) {}

   async cacheAccessToken(userId: string, token: string) {
      const key = Keys.accessToken(userId);
      return this.redisService.setKey(key, token, this.accessTokenTTL);
   }

   async getAccessToken(userId: string): Promise<string | null> {
      const key = Keys.accessToken(userId);
      return this.redisService.getKey(key);
   }

   async cacheRefreshToken(userId: string, token: string) {
      const key = Keys.refreshToken(userId);
      return this.redisService.setKey(key, token, this.refreshTokenTTL);
   }

   async getRefreshToken(userId: string): Promise<string | null> {
      const key = Keys.refreshToken(userId);
      return this.redisService.getKey(key);
   }

   async deleteTokens(userId: string) {
      const accessKey = `access_token:${userId}`;
      const refreshKey = `refresh_token:${userId}`;
      await this.redisService.deleteKey(accessKey);
      await this.redisService.deleteKey(refreshKey);
   }
}
