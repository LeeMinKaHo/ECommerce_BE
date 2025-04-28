import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { Inject, Service } from "typedi";
import { ReviewService } from "./review.service";
import { CreateReviewDTO } from "./dtos/create-review.dto";
import { ResponseCustom } from "../shared/response-custom";


@Service()
export class reviewController{
    constructor(@Inject() private reviewService : ReviewService){}
    async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            const dto = CreateReviewDTO.fromRequest(req.body);
            const data = await this.reviewService.createReview(dto);
            res.status(201).json(new ResponseCustom(data,null,null));
        } catch (error) {
            next(error);
        }
    }
}