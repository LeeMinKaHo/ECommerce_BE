import { ErrorCustom } from "../errors/error-custom";


export class ResponseCustom {
   data: any;
   error?: ErrorCustom;
   pagination?: any;
   constructor(data: any, error: ErrorCustom, pagination: any) {
      this.data = data;
      this.error = error;
      this.pagination = pagination;
   }
}
