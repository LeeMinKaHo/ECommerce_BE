import { Router } from "express";
import { Inject, Service } from "typedi";

import { AuthorizeMiddleware } from "../auth/auth.middleware";
import { InvoiceController } from "./invoice.controller";
@Service()
export class InvoiceRouter {
   private router;
   constructor(
      @Inject() private invoiceController: InvoiceController,
      @Inject() private authMiddleware: AuthorizeMiddleware
   ) {
      this.router = Router();
      this.initalizeRouter();
   }
   initalizeRouter() {
      // ✅ Route GET ALL phải đứng TRƯỚC
      this.router.get(
         "/",
         this.invoiceController.getInvoice.bind(this.invoiceController)
      );

      // ✅ Route GET ONE đứng SAU
      this.router.get(
         "/:invoiceId",
         this.invoiceController.getInvoiceById.bind(this.invoiceController)
      );
      this.router.get(
         "/user/me",
         this.authMiddleware.authorize,
         this.invoiceController.getInvoicesByUser.bind(this.invoiceController)
      );
      this.router.post(
         "/",
         this.authMiddleware.authorize,
         this.invoiceController.createInvoice.bind(this.invoiceController)
      );

      this.router.post(
         "/capture/:paypalOrderId",
         this.authMiddleware.authorize,
         this.invoiceController.captureInvoice.bind(this.invoiceController)
      );
      this.router.put(
         "/:invoiceId",
         this.authMiddleware.authorize,
         this.invoiceController.updateInvoiceStatus.bind(this.invoiceController)
      );
     
   }

   getRouter() {
      return this.router;
   }
}
