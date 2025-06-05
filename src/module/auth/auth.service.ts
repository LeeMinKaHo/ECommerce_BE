import jwt, { JwtPayload } from "jsonwebtoken";
import { Inject, Service } from "typedi";
import { PayLoad } from "./auth.types";
import { Config } from "../shared/config";
import { CodeGenerator } from "../shared/utils";
import { RedisService } from "../redis/redis.service";
import { timeExpire, Keys } from "../shared/auth.shared";
import { AuthRes } from "./dto/auth-res.dto";

@Service()
export class AuthService {
   constructor(
      @Inject() private redisService: RedisService,
      @Inject() private config: Config
   ) {}
   // gen access ,refresh ,
   // verify token ,refresh
   // import module redis
   // env tạo folder inject

   // gen -> generate
   async genAndCacheAccess(payload: PayLoad) {
      const { email } = payload;
      const access = jwt.sign({ ...payload }, this.config.accessTokenSecret, {
         expiresIn: timeExpire.accessToken,
      });
      await this.redisService.setKey(
         Keys.accessToken(email),
         access,
         timeExpire.accessToken
      );
      return access;
   }
   async genAndCacheRefresh(payload: PayLoad) {
      const { email } = payload;
      const refresh = jwt.sign({ ...payload }, this.config.refreshTokenSecret, {
         expiresIn: timeExpire.refreshToken,
      });
      await this.redisService.setKey(
         Keys.refreshToken(email),
         refresh,
         timeExpire.refreshToken
      );
      return refresh;
   }
   async handleAuthToken(payload: PayLoad) {
      const access = await this.genAndCacheAccess(payload);
      const refresh = await this.genAndCacheRefresh(payload);

      return { access, refresh };
   }
   async invalidateToken(email: string) {
      await this.redisService.deleteKey(Keys.accessToken(email));
      await this.redisService.deleteKey(Keys.refreshToken(email));
   }
   verifyAccessToken(token: string): PayLoad {
      const decoded = jwt.verify(
         token,
         this.config.accessTokenSecret
      ) as JwtPayload;

      return new PayLoad(decoded.email, decoded.role);
   }

   verifyRefreshToken(token: string): PayLoad {
      const decoded = jwt.verify(
         token,
         this.config.refreshTokenSecret
      ) as JwtPayload;
      return new PayLoad(decoded.email, decoded.role);
   }

   // ************ CACHE *******************

   async cacheVerifyCode(userId: string, code: string) {
      return this.redisService.setKey(
         Keys.verificationCode(userId),
         code,
         timeExpire.verifyCode
      );
   }
   async genAndCacheCode(userId: string) {
      const code = CodeGenerator.generateVerificationCode();
      await this.cacheVerifyCode(userId, code);
      return code;
   }
   // ************* Remove cache ***************8

   async getAllAccessTokenUser(userId: number) {
      return await this.redisService.getKeys(Keys.allUserAccessToken(userId));
   }
   async getAllRefreshTokenUser(userId: number) {
      return await this.redisService.getKeys(Keys.allUserRefreshToken(userId));
   }
   async removeAllTokens(userId: number): Promise<void> {
      const accessKeys = await this.getAllAccessTokenUser(userId);
      const refreshKeys = await this.getAllRefreshTokenUser(userId);

      const allKeys = [...accessKeys, ...refreshKeys];

      if (allKeys.length > 0) {
         // Xóa tất cả keys lấy được
         const deleteResults = await Promise.all(
            allKeys.map((key) => this.redisService.deleteKey(key))
         );

         // Kiểm tra kết quả xóa
         const successCount = deleteResults.filter((result) => result).length;
         console.log(
            `Successfully deleted ${successCount} tokens for user ${userId}`
         );
      } else {
         console.log(`No tokens found for user ${userId}`);
      }
   }
}
