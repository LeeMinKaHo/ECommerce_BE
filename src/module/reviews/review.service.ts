import { Inject, Service } from "typedi";
import { CreateReviewDTO } from "./dtos/create-review.dto";
import reviewModel from "./review.model";
import { IUser } from "../user/model/user.model";
import { InvoiceService } from "../invoice/invoice.service";
import { Error } from "../shared/error/error-custom";
import mongoose from "mongoose";
import { UserService } from "../user/user.service";
@Service()
export class ReviewService {
   constructor(
      @Inject() private invoiceService: InvoiceService,
      @Inject() private userService: UserService
   ) {}
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

   async createReview(reviewData: CreateReviewDTO, email: string) {
      const { invoiceId } = reviewData;
      const invoice = await this.invoiceService.findInvoice(invoiceId);
      const user = await this.userService.findUserByEmail(email)
      if(invoice.userId == user._id) throw Error.NotBelongUser
      // Logic to create a new review
      const newReview = new reviewModel(reviewData);
      await newReview.save();
      return newReview;
   }

   async updateReview(id: string, reviewData: any) {
      // Logic to update a review
   }

   async deleteReview(id: string) {}
}
