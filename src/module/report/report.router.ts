import { Router } from "express";
import { Inject, Service } from "typedi";
import { ReportController } from "./report.controller";
import { AuthorizeMiddleware } from "../auth/auth.middleware";
import { userRole } from "../user/user.types";

@Service()
export class ReportRouter {
   private router: Router;

   constructor(
      @Inject() private reportController: ReportController,
      @Inject() private authMiddleware: AuthorizeMiddleware
   ) {
      this.router = Router();
      this.initalizeRouter();
   }

   private initalizeRouter() {
      const auth = this.authMiddleware.authorize;
      const admin = this.authMiddleware.authorizeRoles(userRole.Admin);
      const ctrl = this.reportController;

      // Overview stats (counts)
      this.router.get(
         "/reports/overview",
         auth,
         admin,
         ctrl.overview.bind(ctrl)
      );

      // Revenue time-series stats (for charts)
      this.router.get(
        "/reports/revenue",
        auth,
        admin,
        ctrl.getRevenueStats.bind(ctrl)
      );
   }

   getRouter() {
      return this.router;
   }
}
