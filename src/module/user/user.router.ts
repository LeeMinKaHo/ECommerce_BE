import { Router } from "express";
import { UserController } from "./user.controller";
import { Inject, Service } from "typedi";
import { AuthorizeMiddleware } from "../auth/auth.middleware";
import { validateLoginDTO } from "./user.middleware";
@Service()
export class UserRouter {
   private router: Router;
   constructor(
      @Inject() private authMiddleware: AuthorizeMiddleware,
      @Inject() private userController: UserController
   ) {
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
         validateLoginDTO,
         this.userController.login.bind(this.userController)
      ),
         this.router.post(
            "/verify",
            this.userController.verifyCode.bind(this.userController)
         );
      this.router.get(
         "/profile",
         this.authMiddleware.authorize,
         this.userController.getUser.bind(this.userController)
      );
      this.router.get(
         "/:userId",
         this.userController.getUser.bind(this.userController)
      );

      this.router.post(
         "/refresh",
         this.authMiddleware.authorizeRefreshToken,
         this.userController.refreshToken.bind(this.userController)
      );
   }
   public getRouter(): Router {
      return this.router;
   }
}
