import { Service } from "typedi";
import { Pagination } from "../shared/http/pagination.dto";
import { CreateProductDTO } from "./dto/create-product.dto";
import productModel from "./model/product.model";
import { Error } from "../shared/errors/error-custom";
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

   async checkVariantExists(sizeId: string) {
      // Tìm sản phẩm chứa sizeId bên trong colorVariants.sizes
      const product = await productModel.findOne(
         { "colorVariants.sizes._id": new Types.ObjectId(sizeId) },
         { "colorVariants.$": 1 }
      );

      if (!product || !product.colorVariants || product.colorVariants.length === 0) {
         throw Error.ProductVariantNotFound;
      }

      // Tìm size cụ thể trong màu đó
      const colorVar = product.colorVariants[0];
      const sizeEntry = colorVar.sizes.find(s => s._id?.toString() === sizeId);
      
      if (!sizeEntry) throw Error.ProductVariantNotFound;

      return { colorVar, sizeEntry };
   }
   getProductWithVariant = async (
      productId: Types.ObjectId,
      sizeId: Types.ObjectId
   ): Promise<ProductWithVariant | null> => {
      const result = await productModel.aggregate<any>([
         { $match: { _id: productId, "colorVariants.sizes._id": sizeId } },
         {
            $project: {
               name: 1,
               categoryName: 1,
               price: 1,
               colorVariant: {
                  $arrayElemAt: [
                     {
                        $filter: {
                           input: "$colorVariants",
                           cond: { $in: [sizeId, "$$this.sizes._id"] },
                        },
                     },
                     0,
                  ],
               },
            },
         },
         {
            $addFields: {
               sizeEntry: {
                  $arrayElemAt: [
                     {
                        $filter: {
                           input: "$colorVariant.sizes",
                           cond: { $eq: ["$$this._id", sizeId] },
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
