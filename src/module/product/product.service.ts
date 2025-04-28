import { Service } from "typedi";
import { CreateProductDTO } from "./dto/create-product.dto";
import productModel from "./model/product.model";
import { PayLoad } from "../auth/auth.types";
import mongoose, { Types } from "mongoose";
import { Pagination } from "../shared/dto/pagination.dto";
import { Error } from "../shared/error/error-custom";
import sizeModel from "./model/size.model";
import productSizeModel from "./model/product-variant.model";
import { SearchProductDTO } from "./dto/search-product.dto";
import categoryModel from "./model/category.model";

@Service()
export class ProductService {
   async createProduct(createProductDTO: CreateProductDTO, payload: PayLoad) {
      const newProduct = await productModel.create(createProductDTO);
      if (mongoose.Types.ObjectId.isValid(payload.userId)) {
         newProduct.createBy = new mongoose.Types.ObjectId(payload.userId);
      } else {
         // Xử lý nếu userId không hợp lệ
         throw Error.BadRequest;
      }
      await newProduct.save();
      return newProduct.toObject();
   }
   async getProduct(productId: string) {
      const objectId = new Types.ObjectId(productId);
      const result = await productModel.aggregate([
         { $match: { _id: objectId } },
         {
            $lookup: {
               from: "productvariants", // Tên collection lưu variants
               localField: "_id",
               foreignField: "productId",
               as: "variants",
            },
         },
         {
            $unwind: {
               path: "$variants",
               preserveNullAndEmptyArrays: true,
            },
         },
         {
            $lookup: {
               from: "sizes", // Tên collection lưu size
               localField: "variants.sizeId",
               foreignField: "_id",
               as: "sizeDetails",
            },
         },
         {
            $unwind: {
               path: "$sizeDetails",
               preserveNullAndEmptyArrays: true,
            },
         },
         {
            $group: {
               _id: "$_id",
               name: { $first: "$name" },
               description: { $first: "$description" },
               price: { $first: "$price" },
               quanlity: { $first: "$quanlity" },
               quanlitySold: { $first: "$quanlitySold" },
               variants: {
                  $push: {
                     color: "$variants.color",
                     imageUrl: "$variants.imageUrl",
                     quantity: "$variants.quantity",
                     size: "$sizeDetails.name", // Lấy tên size từ bảng sizes
                  },
               },
            },
         },
      ]);

      if (!result || result.length === 0) throw Error.ProductNotFound;
      return result[0];
   }

   async getAllProduct(pagination: Pagination, categoryId?: string) {
      const filter: any = {};

      if (categoryId) {
         filter.categoryId = categoryId;
      }

      const products = await productModel
         .find(filter)
         .skip(pagination.getOffSet())
         .limit(pagination.limit)
         .exec();

      pagination.total = await productModel.countDocuments(filter);

      return {
         products,
         pagination,
      };
   }
   async checkProductActive(productId: string) {
      const product = await this.getProduct(productId);
      if (product.isDeleted == true) {
         throw Error.ProductNotActive;
      }
   }
   async getProductSize(searchProDTO: SearchProductDTO) {
      const { productId, sizeId, color } = searchProDTO;

      const productSize = await productSizeModel
         .findOne({
            productId: new Types.ObjectId(productId),
            sizeId: new Types.ObjectId(sizeId),
            color: color, // tìm đúng màu luôn
         })
         .populate("sizeId")
         .lean();

      if (!productSize) {
         throw Error.ProductNotFound;
      }

      return {
         color: productSize.color,
         imageUrl: productSize.imageUrl, // nếu có
         quantity: productSize.quantity,
      };
   }
   async getAllCategory() {
      // const categories = await categoryModel.find({}).lean()
      return categoryModel.find({}).lean();
   }
   updateProduct(productId: string) {}
   deleteProduct() {}
}
