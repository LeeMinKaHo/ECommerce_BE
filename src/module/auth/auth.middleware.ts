import { validateOrReject } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { RedisService } from "../redis/redis.service";
import { AuthService} from "./auth.service";
import { Inject, Service } from "typedi";
import { Keys } from "../shared/auth.shared";
import { AuthRequest, PayLoad } from "./auth.types";
import { RefreshTokenDTO } from "./dto/refresh.dto";
import { Error } from "../shared/error/error-custom";

@Service()
export class AuthorizeMiddleware {
   constructor(
      @Inject() private authService: AuthService,
      @Inject() private redisService: RedisService
   ) {}
   authorize = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
         const authHeader = req.headers.authorization;
         if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw Error.UnAuthorize;
         }

         const token = authHeader.split(" ")[1]; // Lấy token từ "Bearer <token>"

         const payload: PayLoad = this.authService.verifyAccessToken(token);
         req.payload = payload;
         const acssesToken = await this.redisService.getKey(
            Keys.accessToken(payload.userId)
         );

         if (token === acssesToken) {
            return next();
         }
         next(Error.accessTokenInvalid);
      } catch (error) {
         //next(error)
         next(error);
      }
   };

   authorizeRefreshToken = async (
      req: AuthRequest,
      res: Response,
      next: NextFunction
   ) => {
      try {
         const accessDTO = RefreshTokenDTO.fromRequest(req.body);
         await validateOrReject(accessDTO);

         const payload: PayLoad = this.authService.verifyRefreshToken(
            accessDTO.refreshToken
         );
         req.payload = payload;
        
         //req.payload = payload
         const refreshToken = await this.redisService.getKey(
            Keys.refreshToken(payload.userId)
         );
         if (accessDTO.refreshToken === refreshToken) {
           return  next();
         }
         next(Error.accessTokenInvalid);
      } catch (error) {
         console.log(error);
         //next(error);
         next(error);
      }
   };
   verifyCode = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { code, userId } = req.body;

         const codeCache = await this.redisService.getKey(
            Keys.verificationCode(userId)
         );
         if (code !== codeCache) {
            throw Error.BadRequest;
         }
         next();
      } catch (error) {
         next(error);
      }
   };
}
