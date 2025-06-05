import { Router } from "express";
import { Inject, Service } from "typedi";
import { ReviewController } from "./review.controller";
@Service()
export class ReviewRouter {
   public router: Router;

   constructor(@Inject() private reviewController: ReviewController) {
      this.router = Router(); // <-- Thêm dòng này
      this.initRoutes();
   }

   initRoutes() {
      this.router.post("/", this.reviewController.createReview.bind(this.reviewController));
      // this.router.get("/get/:id", this.reviewController.getReviewById);
      // this.router.get("/getAll", this.reviewController.getAllReviews);
      // this.router.put("/update/:id", this.reviewController.updateReview);
      // this.router.delete("/delete/:id", this.reviewController.deleteReview);
   }
   getRouter() {
      return this.router;
   }
}
