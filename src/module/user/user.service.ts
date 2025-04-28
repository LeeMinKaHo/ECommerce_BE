import { Inject, Service } from "typedi";
import { CreateUserDTO } from "./dtos/create-user.dto";
import userModel, { User } from "./model/user.model";
import { HydratedDocument } from "mongoose";
import {
   comparePassword,
   hashPassword,
   initTransaction,
} from "../shared/utils";
import { LoginDTO } from "./dtos/login.dto";
import userAdvanceModel from "./model/user-advance.model";
import { Error } from "../shared/error/error-custom";
import { QueueManager } from "../bullmq/queue-manager";
import { queueName, jobName } from "../shared/bullmq.share";
import { AuthService } from "../auth/auth.service";
import { emit } from "process";
import { RedisService } from "../redis/redis.service";
import { Keys } from "../shared/auth.shared";
import { userActive } from "./user.types";
@Service()
export class UserService {
   constructor(
      @Inject() private authService : AuthService,
      @Inject() private redisService : RedisService ,
      @Inject() private queueManager : QueueManager){}
   async createUser(createUser: CreateUserDTO) {
      let userId : string
      await initTransaction(async (session) => {
         createUser.password = await hashPassword(createUser.password);

         const user = new userModel(createUser);
         
         await user.save({ session }); // Đảm bảo lưu trong transaction
         userId = user.id
         const userAdvance = new userAdvanceModel({ user: user.id });
         await userAdvance.save({ session });

          // Nếu cần return thông tin user
      });
       const code = await this.authService.genAndCacheCode(userId)
      this.queueManager.addJob(queueName.email, jobName.sendMail, {
         email: createUser.email,
         subject: "Welcome to Our Platform",
         body: `Thank you for registering! We're excited to have you. Your code : ${code}`,
         
      });
      return await this.findUser(userId)
   }
   async findUser(userId: string) {
      const user = await userModel.findById(userId);
      if (!user) {
         throw Error.UserNotFound;
      }
      return user;
   }
   async findUserByEmail(email:string){
      const user = await userModel.findOne({email})
      if (!user) {
         throw Error.UserNotFound;
      }
      return user;
   }
   async checkUserValid(loginDTO: LoginDTO) {
      const { email, password } = loginDTO;
     
      const user = await this.isUserActive(email);
      // Kiểm tra mật khẩu
      if (await comparePassword(password, user.password)) {
         return user.toObject({
            transform: (doc, ret, options) => {
               // Chuyển _id thành string
               ret._id = ret._id.toString();
               return ret;
            },
         });
      } else {
         throw  Error.IncorrectPass // Sai mật khẩu
      }
   }
   
   async verifyCode(email: string, code: string) {
      const user = await this.findUserByEmail(email);
      if(user.isActive == userActive.active) throw Error.UserAlreadyActive
      console.log(user)
      const codeCache = await this.redisService.getKey(Keys.verificationCode(user.id));
  
      if (code !== codeCache) {
          throw Error.CodeNotValid;
      }
  
      await userModel.updateOne(
          { _id: user.id },
          { $set: { isActive: userActive.active } }
      );
  
      return true;
  }
  
   async isUserActive(email : string) {
      const user = await this.findUserByEmail(email)
      if(!user.isActive) throw  Error.UserNotActive  
      return user; // Giả sử isActive là một field trong schema
   }
}
