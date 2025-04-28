import { CreateReviewDTO } from "./dtos/create-review.dto";
import reviewModel from "./review.model";

export class ReviewService {
   constructor() {}

   async getAllReviews() {
      // Logic to get all reviews
   }
   async getReviewsByProductId(productId: string) {
      const reviews = await reviewModel
         .find({ productId })
         .populate({
            path: "userId",
            select: "fullName avatar",
            model: "UserAdvance",
         })
         .sort({ createdAt: -1 }); // nếu muốn sort
      if (!reviews || reviews.length === 0) {
         return []; // Trả về mảng rỗng nếu không có đánh giá
      }

      return reviews;
   }
   async getReviewById(id: string) {
      // Logic to get a review by ID
   }

   async createReview(reviewData: CreateReviewDTO) {
      // Logic to create a new review
      const newReview = new reviewModel(reviewData);
      await newReview.save();
      return newReview;
   }

   async updateReview(id: string, reviewData: any) {
      // Logic to update a review
   }

   async deleteReview(id: string) {
      // Logic to delete a review
   }
}
