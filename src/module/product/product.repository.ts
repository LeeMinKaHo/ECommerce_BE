import { Service } from "typedi";
import { Pagination } from "../shared/dto/pagination.dto";
import { CreateProductDTO } from "./dto/create-product.dto";
import productModel from "./model/product.model";
import { Error } from "../shared/error/error-custom";
import { Mongoose, Types } from "mongoose";
import { ProductWithVariant } from "./product.type";

@Service()
export class ProductRepository {
   async findByIdOrFail(productId: string) {
      const product = await productModel.findById(productId);
      if (!product) throw Error.ProductNotFound;
      return product;
   }

   async findDetail(productId: string) {
      return productModel
         .findOne({ _id: productId, isDeleted: false })
         .populate("categoryId");
   }

   async findAll(filter: any, pagination: Pagination, sort?: any) {
      let query = productModel.find(filter);

      if (sort) query = query.sort(sort);

      return query
         .skip(pagination.getOffSet())
         .limit(pagination.limit)
         .populate("categoryId");
   }

   async count(filter: any) {
      return productModel.countDocuments(filter);
   }

   async create(dto: CreateProductDTO) {
      const product = await productModel.create(dto);
      return product.toObject();
   }

   async softDelete(productId: string) {
      return productModel.findByIdAndUpdate(productId, { isDeleted: true });
   }

   async update(productId: string, dto: any) {
      return productModel.findByIdAndUpdate(productId, { $set: dto }, { new: true });
   }

   async checkVariantExists(variantId: string) {
      const product = await productModel.findOne(
         { "variants._id": variantId },
         { "variants.$": 1 } // chỉ lấy đúng variant có _id khớp
      );

      if (!product || !product.variants || product.variants.length === 0) {
         throw Error.ProductVariantNotFound;
      }

      return product.variants[0];
   }
   getProductWithVariant = async (
      productId: Types.ObjectId,
      variantId: Types.ObjectId
   ): Promise<ProductWithVariant | null> => {
      const result = await productModel.aggregate<ProductWithVariant>([
         { $match: { _id: productId, "variants._id": variantId } },
         {
            $project: {
               name: 1,
               categoryName: 1,
               price: 1,
               variant: {
                  $arrayElemAt: [
                     {
                        $filter: {
                           input: "$variants",
                           cond: { $eq: ["$$this._id", variantId] },
                        },
                     },
                     0,
                  ],
               },
            },
         },
      ]);

      return result[0] ?? null;
   };

   async findSimilar(categoryId: string, excludeProductId: string, limit: number = 4) {
      return productModel
         .find({
            categoryId,
            _id: { $ne: new Types.ObjectId(excludeProductId) },
            isDeleted: false,
         })
         .limit(limit)
         .populate("categoryId");
   }
}
