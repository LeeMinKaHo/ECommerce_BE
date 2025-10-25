import { Inject, Service } from "typedi";
import { InvoiceService } from "./invoice.service";
import { AuthRequest } from "../auth/auth.types";
import { NextFunction, Response } from "express";
import { Pagination } from "../shared/dto/pagination.dto";
import { ResponseCustom } from "../shared/response-custom";

@Service()
export class InvoiceController {
   constructor(@Inject() private invoiceService: InvoiceService) {}
   async createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const { email } = req.payload;
         const shippingInfo = req.body.shippingInfo;
         console.log("req body:", req.body);
         console.log("shippingInfo", shippingInfo);
         const invoice = await this.invoiceService.checkoutCart(
            email,
            shippingInfo
         );

         res.status(200).json({
            success: true,
            data: {
               _id: invoice._id,
               paypalOrderId: invoice.paypalOrderId, // 👈 cần cái này cho PayPal
            },
         });
      } catch (error) {
         next(error);
      }
   }
   async captureInvoice(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         console.log("req", req.params);
         const invoiceId = req.params.paypalOrderId;
         const result = await this.invoiceService.captureInvoice(invoiceId);
         res.status(200).json(new ResponseCustom(result, null, null));
      } catch (error) {
         next(error);
      }
   }
   async getInvoice(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const {items , pagination} = await this.invoiceService.getInvoice(
            Pagination.fromRequest(req)
         );
         res.json(new ResponseCustom(items, null, pagination));
      } catch (error) {
         next(error);
      }
   }
}
