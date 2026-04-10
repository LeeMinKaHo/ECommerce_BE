import { Request } from 'express';
import { InvoiceStatus } from '../model/invoice.model';

export class InvoiceFilterDTO {
  status?: InvoiceStatus;

  static FromRequest(req: Request): InvoiceFilterDTO {
    const filter = new InvoiceFilterDTO();
    const rawStatus = req.query?.status?.toString();

    // Chỉ chấp nhận các giá trị hợp lệ từ enum InvoiceStatus
    if (rawStatus && Object.values(InvoiceStatus).includes(rawStatus as InvoiceStatus)) {
      filter.status = rawStatus as InvoiceStatus;
    }

    return filter;
  }
}