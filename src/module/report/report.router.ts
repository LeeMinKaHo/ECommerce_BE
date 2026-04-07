import { Router } from "express";
import { Inject, Service } from "typedi";
import { ReportController } from "./report.controller";
import { AuthorizeMiddleware } from "../auth/auth.middleware";
import { userRole } from "../user/user.types";

@Service()
export class ReportRouter {
   private router;
   constructor(
     @Inject() private reportController: ReportController,
     @Inject() private authMiddleware: AuthorizeMiddleware
   ) {
      this.router = Router();
      this.initalizeRouter();
   }
   initalizeRouter() {
      this.router.get(
         "/reports",
         this.authMiddleware.authorize,
         this.authMiddleware.authorizeRoles(userRole.Admin),
         this.reportController.overview.bind(this.reportController)
      );
   }
   getRouter() {
      return this.router;
   }
}
