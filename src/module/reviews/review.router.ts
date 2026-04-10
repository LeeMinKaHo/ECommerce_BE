import { Router } from "express";
import { Inject, Service } from "typedi";
import { ReviewController } from "./review.controller";
import { AuthorizeMiddleware } from "../auth/auth.middleware";

@Service()
export class ReviewRouter {
   public router: Router;

   constructor(
      @Inject() private reviewController: ReviewController,
      @Inject() private authMiddleware: AuthorizeMiddleware
   ) {
      this.router = Router();
      this.initRoutes();
   }

   initRoutes() {
      const auth = this.authMiddleware.authorize;
      this.router.post("/", auth, this.reviewController.createReview.bind(this.reviewController));
      // PATCH /reviews/:id/like — toggle like cho review
      this.router.patch("/:id/like", auth, this.reviewController.likeReview.bind(this.reviewController));
   }

   getRouter() {
      return this.router;
   }
}

