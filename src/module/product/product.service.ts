import { Inject, Service } from "typedi";
import { Pagination } from "../shared/dto/pagination.dto";
import { Error } from "../shared/error/error-custom";
import { CreateProductDTO } from "./dto/create-product.dto";
import { FindOptionDTO, SortOption } from "./dto/find-option.dto";
import { ProductResDTO } from "./dto/product-res.dto";
import categoryModel from "./model/category.model";
import productModel from "./model/product.model";
import { ProductRepository } from "./product.repository";
import sizeModel from "./model/size.model";
import { UserService } from "../user/user.service";
import { Types } from "mongoose";
import { RedisService } from "../redis/redis.service";
import { QueueManager } from "../bullmq/queue-manager";
import { queueName, jobName } from "../shared/bullmq.share";
import { RecommendationService } from "./recommendation.service";

@Service()
export class ProductService {
   constructor(
      @Inject() private productRepo: ProductRepository,
      @Inject() private userService: UserService,
      @Inject() private redisService: RedisService,
      @Inject() private queueManager: QueueManager,
      @Inject() private recommendationService: RecommendationService
   ) {}

    private readonly CATEGORY_CACHE_KEY = "categories:all";
    private readonly PRODUCT_CACHE_PREFIX = "products:list:";
    private readonly PRODUCT_DETAIL_PREFIX = "products:detail:";

   async clearProductCache() {
      await this.redisService.deleteKey(this.CATEGORY_CACHE_KEY);
      await this.redisService.deleteByPrefix(this.PRODUCT_CACHE_PREFIX);
   }

   async createProduct(dto: CreateProductDTO, email: string) {
      const user = await this.userService.isUserActive(email);
      dto.createBy = user._id;
      // defaultImage = ảnh đầu tiên của colorVariant đầu tiên
      dto.defaultImage = dto.colorVariants[0]?.imageUrls[0];
      const product = await this.productRepo.create(dto);
      
      // Xóa cache
      await this.clearProductCache();

      // Thêm job AI để tạo embedding
      await this.queueManager.addJob(queueName.ai, jobName.generateEmbedding, {
         productId: product._id,
      });

      return product;
   }

   async getProductDetail(id: string) {
      const cacheKey = `${this.PRODUCT_DETAIL_PREFIX}${id}`;
      
      // 1. Kiểm tra cache
      const cached = await this.redisService.getObject<any>(cacheKey);
      if (cached) {
         console.log("🚀 Get Product Detail from Redis Cache:", id);
         return cached;
      }

      console.log("🐢 Get Product Detail from Database:", id);
      const product = await this.productRepo.findDetail(id);
      if (!product) throw Error.ProductNotFound;

      // Lấy danh sách màu và size duy nhất từ colorVariants
      const colors = product.colorVariants.map((cv) => cv.color);
      const sizes = [...new Set(
         product.colorVariants.flatMap((cv) => cv.sizes.map((s) => s.size))
      )];
      
      const result = { product, colors, sizes };

      // 2. Lưu vào Redis (TTL: 30 minutes = 1800s)
      await this.redisService.setObject(cacheKey, result, 1800);

      return result;
   }
   async deleteProduct(productId: string) {
      const product = await this.productRepo.findByIdOrFail(productId);
      if (!product) throw Error.ProductNotFound;
      if (product.isDeleted) throw Error.ProductAlreadyDeleted;
      const res = await this.productRepo.softDelete(productId);
      
      // Xóa cache
      await this.clearProductCache();
      await this.redisService.deleteKey(`${this.PRODUCT_DETAIL_PREFIX}${productId}`);
      return res;
   }
   async updateProduct(productId: string, dto: any) {
      const product = await this.productRepo.findByIdOrFail(productId);
      if (!product) throw Error.ProductNotFound;
      const res = await this.productRepo.update(productId, dto);
      
      // Xóa cache
      await this.clearProductCache();
      await this.redisService.deleteKey(`${this.PRODUCT_DETAIL_PREFIX}${productId}`);

      // Thêm job AI để cập nhật embedding
      await this.queueManager.addJob(queueName.ai, jobName.generateEmbedding, {
         productId: productId,
      });

      return res;
   }
   async getAllProduct(pagination: Pagination, findOption: FindOptionDTO) {
      // 1. Tạo cache key dựa trên tham số query
      const cacheKey = `${this.PRODUCT_CACHE_PREFIX}${pagination.page}:${pagination.limit}:${JSON.stringify(findOption)}`;
      
      const cached = await this.redisService.getObject<any>(cacheKey);
      if (cached) {
         console.log("🚀 Get Products from Redis Cache:", cacheKey);
         return cached;
      }

      console.log("findOption", findOption);
      const { categoryId, minPrice, maxPrice, sort, name } = findOption;
      console.log("sort", sort);

      const filter: any = { isDeleted: false }; // Đưa isDeleted vào filter luôn

      if (categoryId) {
         filter.categoryId = categoryId;
      }
      if (name) {
         filter.name = { $regex: name, $options: "i" }; // i: không phân biệt hoa thường
      }
      if (minPrice || maxPrice) {
         filter.price = {};
         if (minPrice) filter.price.$gte = minPrice;
         if (maxPrice) filter.price.$lte = maxPrice;
      }

      let sortOption: any = null;

      switch (sort) {
         case SortOption.Price_Asc:
            sortOption = { price: 1 };
            break;
         case SortOption.Price_Desc:
            sortOption = { price: -1 };
            break;
         case SortOption.Rating_Asc:
            sortOption = { rating: 1 };
            break;
         case SortOption.Rating_Desc:
            sortOption = { rating: -1 };
            break;
      }

      const products = await this.productRepo.findAll(
         filter,
         pagination,
         sortOption
      );
      pagination.total = await this.productRepo.count(filter);

      const result = {
         products: products.map((product) => {
            return ProductResDTO.fromEntity(product);
         }),
         pagination,
      };

      // 2. Lưu vào Redis (TTL: 10 minutes cho list)
      await this.redisService.setObject(cacheKey, result, 600);

      return result;
   }

   // etc...
   async getAllCategory() {
      // 1. Kiểm tra trong Redis trước
      const cached = await this.redisService.getObject<any[]>(this.CATEGORY_CACHE_KEY);
      if (cached) {
         console.log("🚀 Get Categories from Redis Cache");
         return cached;
      }

      console.log("🐢 Get Categories from Database (Heavl Lift)");
      const categoriesWithCounts = await categoryModel.aggregate([
         {
            $lookup: {
               from: "products",
               let: { catId: "$_id" },
               pipeline: [
                  { 
                     $match: { 
                        $expr: { 
                           $and: [
                              { $eq: ["$categoryId", "$$catId"] },
                              { $eq: ["$isDeleted", false] }
                           ]
                        }
                     }
                  }
               ],
               as: "categoryProducts"
            }
         },
         {
            $addFields: {
               totalProduct: { $size: "$categoryProducts" }
            }
         },
         {
            $project: {
               categoryProducts: 0
            }
         }
      ]);

      // 2. Lưu vào Redis (TTL: 1 hour = 3600s)
      await this.redisService.setObject(this.CATEGORY_CACHE_KEY, categoriesWithCounts, 3600);

      return categoriesWithCounts;
   }
   // async getProductAndVariant(productId: string, size: string, color: string) {
   //    const product = await this.productRepo.findDetail(productId); // lấy cả populate category
   //    const variant = product.variants.find(
   //       (v) => v.size === size && v.color === color
   //    );

   //    if (!variant) {
   //       throw Error.ProductVariantNotFound;
   //    }

   //    return {
   //       product,
   //       variant,
   //    };
   // }
   async getAllSizes() {
      const sizes = sizeModel.find({}).lean();
      return sizes;
   }
   async findById(productId: string) {
      const product = await this.productRepo.findByIdOrFail(productId);
      if (!product) throw Error.ProductNotFound;
      return product;
   }
   async getProductAndVariant(productId: string, variantId: string) {
      return this.productRepo.getProductWithVariant(new Types.ObjectId(productId), new Types.ObjectId(variantId));
   }

   async getSimilarProducts(productId: string) {
      const product = await this.productRepo.findByIdOrFail(productId);
      
      // Nếu sản phẩm chưa có embedding, chạy job tạo embedding và trả về theo category như cũ (fallback)
      if (!product.embedding || product.embedding.length === 0) {
         console.log("⚠️ Product has no embedding, falling back to category and triggering AI job");
         await this.queueManager.addJob(queueName.ai, jobName.generateEmbedding, { productId });
         
         const similarProducts = await this.productRepo.findSimilar(
            product.categoryId.toString(),
            productId
         );
         return similarProducts.map((p) => ProductResDTO.fromEntity(p));
      }

      // Lấy danh sách tất cả sản phẩm (có thể lọc theo category nếu muốn nhanh hơn, 
      // nhưng AI cho phép tìm xuyên category)
      const allProducts = await productModel.find({ 
         _id: { $ne: product._id }, 
         isDeleted: false 
      }).populate("categoryId");

      const topSimilar = this.recommendationService.findTopSimilar(
         product.embedding,
         allProducts,
         4
      );

      return topSimilar.map((p) => ProductResDTO.fromEntity(p));
   }

   async syncEmbeddings() {
      const products = await productModel.find({ isDeleted: false });
      console.log(`🚀 Syncing embeddings for ${products.length} products...`);
      
      for (const product of products) {
         await this.queueManager.addJob(queueName.ai, jobName.generateEmbedding, {
            productId: product._id,
         });
      }
      
      return { message: `Queued ${products.length} products for embedding generation` };
   }
}
