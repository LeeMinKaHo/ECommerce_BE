import { Router } from "express";
import { UserController } from "./user.controller";
import { Inject, Service } from "typedi";
import { AuthorizeMiddleware } from "../auth/auth.middleware";
import { validateLoginDTO } from "./user.middleware";
import { LoginRateLimitMiddleware } from "../shared/middleware/login-rate-limit.middleware";
@Service()
export class UserRouter {
   private router: Router;
   constructor(
      @Inject() private authMiddleware: AuthorizeMiddleware,
      @Inject() private userController: UserController,
      @Inject() private loginRateLimit: LoginRateLimitMiddleware
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
         this.loginRateLimit.limit({
            windowSeconds: 60,
            maxAttempts: 10,
            keyPrefix: "rate:login",
         }),
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
      this.router.post(
         "/logout",
         this.authMiddleware.authorize,
         this.userController.logout.bind(this.userController)
      );
      this.router.put(
         "/profile",
         this.authMiddleware.authorize,
         this.userController.updateUser.bind(this.userController)
      );
   }
   public getRouter(): Router {
      return this.router;
   }
}
