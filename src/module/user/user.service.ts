import mongoose from "mongoose";
import { Inject, Service } from "typedi";
import { AuthService } from "../auth/auth.service";
import { QueueManager } from "../bullmq/queue-manager";
import { jobName, queueName } from "../shared/queue/bullmq.share";
import { Error } from "../shared/errors/error-custom";
import {
   comparePassword,
   hashPassword,
   initTransaction,
} from "../shared/utils/helper";
import { ChangePassworDTO } from "./dtos/change-password.dto";
import { CreateUserDTO } from "./dtos/create-user.dto";
import { LoginRes } from "./dtos/login-res.dto";
import { LoginDTO } from "./dtos/login.dto";
import { LogoutDTO } from "./dtos/logout.dto";
import userAdvanceModel from "./model/user-advance.model";
import { IUser } from "./model/user.model";
import { userActive } from "./user.types";
import { CartService } from "../cart/cart.service";
import { UserRepository } from "./user.repository";
@Service()
export class UserService {
   constructor(
      @Inject() private authService: AuthService,
      @Inject() private queueManager: QueueManager,
      @Inject() private userRepo: UserRepository
   ) {}
   async createUser(createUser: CreateUserDTO) {
      let userId: string;
      await initTransaction(async (session) => {
         createUser.password = await hashPassword(createUser.password);

         // keep direct mongoose usage for create (transaction/session)
         const userModel = (await import("./model/user.model")).default;
         const user = new userModel(createUser);

         await user.save({ session }); // Đảm bảo lưu trong transaction
         userId = user._id;
         const userAdvance = new userAdvanceModel({ user: user.id });
         await userAdvance.save({ session });

         // Nếu cần return thông tin user
      });
      const code = await this.authService.genAndCacheCode(userId);
      this.queueManager.addJob(queueName.email, jobName.sendMail, {
         email: createUser.email,
         subject: "Welcome to Our Platform",
         body: `Thank you for registering! We're excited to have you. Your code : ${code}`,
      });
      return await this.findUser(new mongoose.Types.ObjectId(userId));
   }
   async findUser(userId: mongoose.Types.ObjectId): Promise<IUser> {
      const user = await this.userRepo.findById(userId.toString());
      if (!user) {
         throw Error.UserNotFound;
      }
      return user;
   }
   async findUserByEmail(email: string) {
      const user = await this.userRepo.findByEmail(email);
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
         throw Error.IncorrectPass; // Sai mật khẩu
      }
   }

   async verifyCode(email: string, code: string) {
      const user = await this.findUserByEmail(email);
      if (user.isActive == userActive.active) throw Error.UserAlreadyActive;
      await this.userRepo.updateById(user.id, { isActive: userActive.active });

      return true;
   }

   async isUserActive(email: string) {
      const user = await this.findUserByEmail(email);
      if (!user.isActive) throw Error.UserNotActive;
      return user; // Giả sử isActive là một field trong schema
   }
   private async generateLoginResponse(user: any) {
      const { email, role } = user;
      const { access, refresh } = await this.authService.handleAuthToken({
         email,
         role,
      });
      // Gửi email thông báo đăng nhập thành công
      return {
         response: LoginRes.fromLoginRes({ user, access }),
         refreshToken: refresh,
      };
   }
   async login(loginDTO: LoginDTO) {
      const { email, password } = loginDTO;
      const userDoc = await this.isUserActive(email);
      const user = userDoc.toObject();
      const checkPassword = await comparePassword(password, user.password);
      if (!checkPassword) throw Error.IncorrectPass;
      return this.generateLoginResponse(user);
   }

   async refreshToken(email: string) {
      const user = (await this.isUserActive(email)).toObject();
      return this.generateLoginResponse(user);
   }

   async logout(logoutDTO: LogoutDTO) {
      const { email } = logoutDTO;
      await this.authService.invalidateToken(email);
   }
   async changePassword(changePassworDTO: ChangePassworDTO) {
      const { email, password, newPassword } = changePassworDTO;
      const user = await this.findUserByEmail(email);
      const { password: userPass, role } = user;
      const checkPassword = await comparePassword(password, userPass);
      if (!checkPassword) throw Error.IncorrectPass;
      user.password = await hashPassword(newPassword);
      await user.save();
      await this.authService.invalidateToken(email);
      await this.authService.handleAuthToken({ email, role });
   }
   async getUserIdByEmail(email: string): Promise<IUser> {
      const user = await this.userRepo.findByEmail(email);
      if (!user) throw Error.UserNotFound;
      return user.toObject();
   }
   // async getUserAdvance(email: string  ) {
   //    const user = await this.findUserByEmail(email);
   //    const cartCount = await this.cartService.getCartLength(email);
   //    return{
   //       ...user.toObject(),
   //       cartCount,
   //    }
   // }
   async updateUserProfile(email: string, updateData: Partial<IUser>) {
      const disallowedFields = [
         "password",
         "role",
         "isDeleted",
         "isBanned",
         "isActive",
      ];
      disallowedFields.forEach((f) => delete updateData[f]);
      const user = await this.findUserByEmail(email);
      Object.assign(user, updateData);
      await user.save();
      return user;
   }
}
