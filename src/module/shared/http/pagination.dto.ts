import { Request } from "express";
export class Pagination {
   page: number;
   limit: number;
   total?: number;
   constructor(page: number, limit: number, total?: number) {
      (this.page = page), (this.limit = limit), (this.total = total);
   }
   getOffSet = () => (this.page - 1) * this.limit;
   static fromRequest(req: Request) {
      const page = Number(req.query?.page || 1);
      const limit = Number(req.query?.limit || 10);
      return new Pagination(page, limit);
   }
}
