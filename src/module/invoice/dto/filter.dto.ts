import { Request } from "express";
export class InvoiceFilterDTO {
   status?: string
    static FromRequest(req: Request): InvoiceFilterDTO {
       const filter = new InvoiceFilterDTO();
       if (req.query?.status) filter.status =  req.query.status.toString();
       return filter;
    }
}