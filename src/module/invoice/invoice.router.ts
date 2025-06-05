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
      this.router.get(
         "/",
         this.invoiceController.getInvoice.bind(this.invoiceController)
      );
   }
   getRouter() {
      return this.router;
   }
}
