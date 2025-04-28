import jwt from "jsonwebtoken";
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
   generateAccessAndRefresh(payload: PayLoad) {
      // sửa lại payload
      // this.generateAccess({ userId , deviceId })
      // this.generateRefresh({ userId , deviceId})
      const accessToken = this.generateAccess(payload);
      const refreshToken = this.generateRefresh(payload);
   
      return new AuthRes(accessToken, refreshToken);
   }
   generateAccess(payload: PayLoad) {
      return jwt.sign(
         { ...payload },

         this.config.accessTokenSecret,
         {
            expiresIn: timeExpire.accessToken,
         }
      );
   }

   generateRefresh(payload: PayLoad) {
      return jwt.sign({ ...payload }, this.config.refreshTokenSecret, {
         expiresIn: timeExpire.refreshToken,
      });
   }
   verifyAccessToken(token: string): PayLoad {
      const decoded = jwt.verify(token, this.config.refreshTokenSecret);
      // Tạo lại payload chỉ chứa 2 trường userId và deviceId
      return new PayLoad(decoded.userId);
   }
   verifyRefreshToken(token: string): PayLoad {
      const decoded = jwt.verify(token, this.config.refreshTokenSecret);
      // Tạo lại payload chỉ chứa 2 trường userId và deviceId
      return new PayLoad(decoded.userId);
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
