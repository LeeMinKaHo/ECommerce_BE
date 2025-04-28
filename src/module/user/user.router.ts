import { Router } from "express";
import { UserController } from "./user.controller";
import { Inject, Service } from "typedi";
@Service()
export class UserRouter {
   private router: Router;
   constructor(@Inject() private userController: UserController) {
      this.router = Router();
      this.initalizeRouter();
   }
   initalizeRouter() {
      this.router.post(
         "/",
         this.userController.createUser.bind(this.userController)
      );
      this.router.post(
         "/login",
         this.userController.login.bind(this.userController)
      ),
      this.router.post(
         "/verify",
         this.userController.verifyCode.bind(this.userController)
      );
   }
   public getRouter(): Router {
      return this.router;
   }
}
