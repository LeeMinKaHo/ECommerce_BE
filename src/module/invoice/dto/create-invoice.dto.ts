import { Expose, plainToInstance } from "class-transformer";

export class CreateInvoiceDTO {
   @Expose()
   shippingInfo: {
      name: string;
      address: string;
      phone: string;
   };
   @Expose()
   paymnetMethod: string;
   static fromRequest(data: any) {
      return plainToInstance(CreateInvoiceDTO, data, {
         excludeExtraneousValues: true,
      });
   }
}
