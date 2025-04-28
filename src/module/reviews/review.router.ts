import { Router } from "express";
import { Inject } from "typedi";
import { reviewController } from "./review.controller";

export class ReviewRouter {
   public router: Router;

   constructor(@Inject() private reviewController: reviewController) {
      this.router = Router(); // <-- Thêm dòng này
      this.initRoutes();
   }

   initRoutes() {
      this.router.post("/create", this.reviewController.createReview);
      // this.router.get("/get/:id", this.reviewController.getReviewById);
      // this.router.get("/getAll", this.reviewController.getAllReviews);
      // this.router.put("/update/:id", this.reviewController.updateReview);
      // this.router.delete("/delete/:id", this.reviewController.deleteReview);
   }
}
