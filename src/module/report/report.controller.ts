import { Service } from "typedi";
import { ReportService } from "./report.service";
import { ResponseCustom } from "../shared/response-custom";
import { NextFunction, Request, Response } from "express";
@Service()
export class ReportController {
   constructor(private reportService: ReportService) {}
   async overview(req: Request, res: Response, next: NextFunction) {
      try {
         const data = await this.reportService.overview();
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }
}
