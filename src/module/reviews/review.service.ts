import { Inject, Service } from "typedi";
import { CreateReviewDTO } from "./dtos/create-review.dto";
import reviewModel from "./review.model";
import { IUser } from "../user/model/user.model";
import { InvoiceService } from "../invoice/invoice.service";
import { Error } from "../shared/error/error-custom";
import mongoose from "mongoose";
import { UserService } from "../user/user.service";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "../notification/notification.model";
@Service()
export class ReviewService {
   constructor(
      @Inject() private invoiceService: InvoiceService,
      @Inject() private userService: UserService,
      @Inject() private notificationService: NotificationService
   ) { }
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
      if (invoice.userId == user._id) throw Error.NotBelongUser
      // Logic to create a new review
      const newReview = new reviewModel(reviewData);
      await newReview.save();
      return newReview;
   }

   async updateReview(id: string, reviewData: any) {
      // Logic to update a review
   }

   async deleteReview(id: string) { }

   /**
    * ✅ Toggle like cho một review.
    * - Nếu user chưa like → thêm like + gửi thông báo cho tác giả review
    * - Nếu user đã like rồi → bỏ like (unlike)
    */
   async likeReview(reviewId: string, likerEmail: string) {
      const liker = await this.userService.findUserByEmail(likerEmail);
      const likerId = liker._id;

      const review = await reviewModel.findById(reviewId);
      if (!review) throw Error.BadRequest;

      const alreadyLiked = review.likes.some(
         (id) => id.toString() === likerId.toString()
      );

      let liked: boolean;
      if (alreadyLiked) {
         // Unlike
         await reviewModel.updateOne(
            { _id: review._id },
            { $pull: { likes: likerId } }
         );
         liked = false;
      } else {
         // Like
         await reviewModel.updateOne(
            { _id: review._id },
            { $addToSet: { likes: likerId } }
         );
         liked = true;

         // Chỉ gửi thông báo khi like (không gửi khi unlike)
         // và không gửi cho chính mình
         const authorId = review.userId.toString();
         if (authorId !== likerId.toString()) {
            await this.notificationService.notify({
               type: NotificationType.REVIEW_LIKED,
               senderId: likerId.toString(),
               recipientId: authorId,
               payload: {
                  reviewId: review._id.toString(),
                  productId: review.productId.toString(),
                  likerName: liker.name || liker.email,
               },
            });
         }
      }

      const updatedReview = await reviewModel.findById(reviewId);
      return { liked, likesCount: updatedReview.likes.length };
   }
}
