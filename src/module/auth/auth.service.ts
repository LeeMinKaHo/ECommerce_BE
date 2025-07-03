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
