import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";
import { AuthService } from "../auth/auth.service";
import { AuthRequest, PayLoad } from "../auth/auth.types";
import { TokenCacheService } from "../redis/token-cache.service";
import { handleErrorValidation } from "../shared/error/handle-validation-response";
import { ResponseCustom } from "../shared/response-custom";
import { CreateUserDTO } from "./dtos/create-user.dto";
import { LoginDTO } from "./dtos/login.dto";
import { UserService } from "./user.service";
import { QueueManager } from "../bullmq/queue-manager";
import { jobName, queueName } from "../shared/bullmq.share";
@Service()
export class UserController {
   constructor(
      @Inject() private userService: UserService,
      @Inject() private authService: AuthService,
      @Inject() private tokenCacheService: TokenCacheService,
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
         const loginDTO = LoginDTO.fromRequest(req.body);
         const user = await this.userService.checkUserValid(loginDTO);
         const userId = user._id.toString();
         // gentoken
         const authRes = await this.authService.generateAccessAndRefresh(
            new PayLoad(userId)
         );

         // cache token
         await this.tokenCacheService.cacheAccessToken(
            userId,
            authRes.getAccessToken()
         );
         await this.tokenCacheService.cacheRefreshToken(
            userId,
            authRes.getRefreshToken()
         );
        
        
         res.json(new ResponseCustom({ ...user, ...authRes }, null, null));
      } catch (error) {
         handleErrorValidation(error, next);
      }
   };
   logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
         const { userId } = req.payload;
         this.tokenCacheService.deleteTokens(userId);
         res.json(new ResponseCustom(true, null, null));
      } catch (error) {
         next(error);
      }
   };
   verifyCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
         const { email , code } = req.body;
         await this.userService.verifyCode(email, code)
         res.json(new ResponseCustom(true, null, null));
      } catch (error) {
         next(error);
      }
   };
}
