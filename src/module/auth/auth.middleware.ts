import { validateOrReject } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { RedisService } from "../redis/redis.service";
import { AuthService } from "./auth.service";
import { Inject, Service } from "typedi";
import { Keys } from "../shared/auth.shared";
import { AuthRequest, PayLoad } from "./auth.types";
import { RefreshTokenDTO } from "./dto/refresh.dto";
import { Error } from "../shared/error/error-custom";
import { userRole } from "../user/user.types";
@Service()
export class AuthorizeMiddleware {
   constructor(
      @Inject() private authService: AuthService,
      @Inject() private redisService: RedisService
   ) {}
   authorize = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
         const authHeader = req.headers.authorization;
         console.log("authHeader", authHeader);
         if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw Error.UnAuthorize;
         }

         const token = authHeader.split(" ")[1]; // Lấy token từ "Bearer <token>"
         const payload: PayLoad = this.authService.verifyAccessToken(token);
         req.payload = payload;

         const acssesToken = await this.redisService.getKey(
            Keys.accessToken(payload.email)
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
         const { refreshToken } = accessDTO;
         const payload: PayLoad =
            this.authService.verifyRefreshToken(refreshToken);
         req.payload = payload;

         //req.payload = payload
         const refreshTokenCache = await this.redisService.getKey(
            Keys.refreshToken(payload.email)
         );
         console.log("refreshTokenCache", refreshTokenCache);
         console.log("refreshToken", refreshToken);
         if (refreshTokenCache === refreshToken) {
            return next();
         }
         next(Error.refreshTokenInvalid);
      } catch (error) {
         //next(error);
         next(error);
      }
   };
   authorizeRoles = (...allowedRoles: userRole[]) => {
      return (req: AuthRequest, res: Response, next: NextFunction) => {
         try {
            console.log("req.payload", req.payload);
            const userRoleValue = req.payload?.role;

            // Không có role hoặc không nằm trong danh sách được phép
            if (
               userRoleValue === undefined ||
               !allowedRoles.includes(userRoleValue)
            ) {
               next(Error.Forbidden);
               return;
            }
            next();
         } catch (err) {
            next(err);
         }
      };
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
