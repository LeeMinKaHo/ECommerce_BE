import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";
import { AuthRequest } from "../auth/auth.types";
import { QueueManager } from "../bullmq/queue-manager";
import { handleErrorValidation } from "../shared/errors/handle-validation-response";
import { ResponseCustom } from "../shared/response-custom";
import { CreateUserDTO } from "./dtos/create-user.dto";
import { LoginDTO } from "./dtos/login.dto";
import { UserService } from "./user.service";
import { Error } from "../shared/errors/error-custom";
@Service()
export class UserController {
   constructor(
      @Inject() private userService: UserService,

      @Inject() private queueManager: QueueManager
   ) {}
   createUser = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const createUserDTO = CreateUserDTO.fromRequest(req.body);
         console.log(createUserDTO);
         const data = await this.userService.createUser(createUserDTO);
         res.json(data);
      } catch (error) {
         console.log(error);
         handleErrorValidation(error, next);
      }
   };
   login = async (req: Request, res: Response, next: NextFunction) => {
      try {
         const { response, refreshToken } = await this.userService.login(
            LoginDTO.fromRequest(req.body)
         );

         const isProd = process.env.NODE_ENV === "production";
         res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/users/refresh",
            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
         });

         res.json(new ResponseCustom(response, null, null));
      } catch (error) {
         handleErrorValidation(error, next);
      }
   };
   logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
         // Optional: invalidate cached tokens for this user if authenticated
         if (req.payload?.email) {
            await this.userService.logout({ email: req.payload.email } as any);
         }

         const isProd = process.env.NODE_ENV === "production";
         res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/users/refresh",
         });
         res.json(new ResponseCustom(true, null, null));
      } catch (error) {
         handleErrorValidation(error, next);
      }
   };
   verifyCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
         const { email, code } = req.body;
         await this.userService.verifyCode(email, code);
         res.json(new ResponseCustom(true, null, null));
      } catch (error) {
         next(error);
      }
   };
   getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
         console.log("req.payload", req.payload);
         const { email } = req.payload;
         res.json(
            new ResponseCustom(
               await this.userService.findUserByEmail(email),
               null,
               null
            )
         );
      } catch (error) {
         next(error);
      }
   };
   refreshToken = async (
      req: AuthRequest,
      res: Response,
      next: NextFunction
   ) => {
      try {
         const refreshToken = (req as any).cookies?.refreshToken;
         if (!refreshToken || typeof refreshToken !== "string") {
            return next(Error.refreshTokenInvalid);
         }

         // authorizeRefreshToken middleware already validated cookie token,
         // and set req.payload from the refresh token.
         const { email } = req.payload;
         const { response, refreshToken: newRefreshToken } =
            await this.userService.refreshToken(email);

         const isProd = process.env.NODE_ENV === "production";
         res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/users/refresh",
            maxAge: 1000 * 60 * 60 * 24 * 30,
         });

         res.json(new ResponseCustom(response, null, null));
      } catch (error) {
         next(error);
      }
   };
   updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
         const { email } = req.payload;
         const updateUserDTO = req.body;
         const data = await this.userService.updateUserProfile(email, updateUserDTO);
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   };
}
