import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";
import { AuthRequest } from "../auth/auth.types";
import { QueueManager } from "../bullmq/queue-manager";
import { handleErrorValidation } from "../shared/error/handle-validation-response";
import { ResponseCustom } from "../shared/response-custom";
import { CreateUserDTO } from "./dtos/create-user.dto";
import { LoginDTO } from "./dtos/login.dto";
import { UserService } from "./user.service";
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
         console.log("req.body", req.body);
         const user = await this.userService.login(
            LoginDTO.fromRequest(req.body)
         );
         
         res.json(new ResponseCustom(user, null, null));
      } catch (error) {
         handleErrorValidation(error, next);
      }
   };
   logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
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
      const { email } = req.payload;
      try {
         const data = await this.userService.refreshToken(email);
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   };
 
}
