import { validateOrReject } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { RedisService } from "../redis/redis.service";
import { AuthService } from "./auth.service";
import { Inject, Service } from "typedi";
import { Keys } from "../shared/auth.shared";
import { AuthRequest, PayLoad } from "./auth.types";
import { Error } from "../shared/errors/error-custom";
import { userRole } from "../user/user.types";
import { sha256Base64Url } from "../shared/utils/token-hash";
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
            Keys.accessToken(payload.email)
         );

         if (!acssesToken || token !== acssesToken) {
            return next(Error.accessTokenInvalid);
         }
         return next();
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
         const refreshToken =
            (req as any).cookies?.refreshToken ??
            (req.headers["x-refresh-token"] as string | undefined);
         if (!refreshToken || typeof refreshToken !== "string") {
            return next(Error.refreshTokenInvalid);
         }

         const payload: PayLoad =
            this.authService.verifyRefreshToken(refreshToken);
         req.payload = payload;

         const refreshTokenCache = await this.redisService.getKey(
            Keys.refreshToken(payload.email)
         );
         const refreshJtiCache = await this.redisService.getKey(
            Keys.refreshJti(payload.email)
         );

         // Nếu muốn kiểm tra user tồn tại:
         // const user = await this.userService.findByEmail(payload.email);
         // if (!user) return next(Error.refreshTokenInvalid);

         const refreshHash = sha256Base64Url(refreshToken);
         if (
            !refreshTokenCache ||
            refreshHash !== refreshTokenCache ||
            !refreshJtiCache ||
            !payload.jti ||
            refreshJtiCache !== payload.jti
         ) {
            return next(Error.refreshTokenInvalid);
         }

         return next();
      } catch (error) {
         next(Error.refreshTokenInvalid);
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
