import jwt, { JwtPayload } from "jsonwebtoken";
import { Inject, Service } from "typedi";
import { PayLoad } from "./auth.types";
import { Config } from "../shared/config";
import { RedisService } from "../redis/redis.service";
import { timeExpire, Keys } from "../shared/auth.shared";
import crypto from "crypto";
import { sha256Base64Url } from "../shared/utils/token-hash";

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
      const jti = crypto.randomUUID();
      const access = jwt.sign({ ...payload, jti }, this.config.accessTokenSecret, {
         expiresIn: timeExpire.accessToken,
         issuer: "e-commerce",
         audience: "web",
         subject: email,
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
      const jti = crypto.randomUUID();
      const refresh = jwt.sign(
         { ...payload, jti, tokenType: "refresh" },
         this.config.refreshTokenSecret,
         {
            expiresIn: timeExpire.refreshToken,
            issuer: "e-commerce",
            audience: "web",
            subject: email,
         }
      );

      // Store only a hash of refresh token in Redis
      const refreshHash = sha256Base64Url(refresh);
      await this.redisService.setKey(
         Keys.refreshToken(email),
         refreshHash,
         timeExpire.refreshToken
      );
      await this.redisService.setKey(
         Keys.refreshJti(email),
         jti,
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

      return new PayLoad(decoded.email, decoded.role, decoded.jti);
   }

   verifyRefreshToken(token: string): PayLoad {
      const decoded = jwt.verify(
         token,
         this.config.refreshTokenSecret
      ) as JwtPayload;
      if (decoded.tokenType !== "refresh") {
         throw new Error("Invalid refresh token");
      }
      return new PayLoad(decoded.email, decoded.role, decoded.jti);
   }
   async genAndCacheCode(userId: string): Promise<string> {
      const code = Math.floor(1000 + Math.random() * 9000).toString(); // Gen 4 số
      const ttlSeconds = 5 * 60; // 5 phút

      await this.redisService.setKey(
         Keys.verificationCode(userId),
         code,
         ttlSeconds
      );

      return code;
   }
}
