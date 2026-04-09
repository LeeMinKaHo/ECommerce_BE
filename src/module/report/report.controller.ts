import { Service, Inject } from "typedi";
import { ReportService } from "./report.service";
import { ResponseCustom } from "../shared/response-custom";
import { NextFunction, Request, Response } from "express";

@Service()
export class ReportController {
   constructor(@Inject() private reportService: ReportService) {}

   async overview(req: Request, res: Response, next: NextFunction) {
      try {
         const data = await this.reportService.overview();
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }

   async getRevenueStats(req: Request, res: Response, next: NextFunction) {
      try {
         const days = req.query.days ? parseInt(req.query.days as string) : 7;
         const data = await this.reportService.getRevenueStats(days);
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }
}
