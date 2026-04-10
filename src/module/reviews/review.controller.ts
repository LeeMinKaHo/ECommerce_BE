import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { Inject, Service } from "typedi";
import { ReviewService } from "./review.service";
import { CreateReviewDTO } from "./dtos/create-review.dto";
import { ResponseCustom } from "../shared/response-custom";
import { AuthRequest } from "../auth/auth.types";

@Service()
export class ReviewController {
   constructor(@Inject() private reviewService: ReviewService) { }

   async createReview(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const dto = CreateReviewDTO.fromRequest(req.body);
         const { email } = req.payload;
         const data = await this.reviewService.createReview(dto, email);
         res.status(201).json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }

   async likeReview(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const { id } = req.params;
         const { email } = req.payload;
         const data = await this.reviewService.likeReview(id, email);
         res.status(200).json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }
}
