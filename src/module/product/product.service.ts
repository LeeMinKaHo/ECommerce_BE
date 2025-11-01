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

@Service()
export class ProductService {
   constructor(
      @Inject() private productRepo: ProductRepository,
      @Inject() private userService: UserService
   ) {}

   async createProduct(dto: CreateProductDTO, email: string) {
    
      const user = await this.userService.isUserActive(email);
      dto.createBy = user._id;
      dto.defaultImage = dto.variants[0].imageUrl; // Set imgUrl from the first variant
      return this.productRepo.create(dto);
   }

   async getProductDetail(id: string) {
      const product = await this.productRepo.findDetail(id);
      if (!product) throw Error.ProductNotFound;

      const getUniqueValues = <T>(arr: T[]) => [...new Set(arr)];
      const colors = getUniqueValues(product.variants.map((v) => v.color));
      const sizes = getUniqueValues(product.variants.map((v) => v.size));
      return { product, colors, sizes };
   }
   async deleteProduct(productId: string) {
      const product = await this.productRepo.findByIdOrFail(productId);
      if (!product) throw Error.ProductNotFound;
      if (product.isDeleted) throw Error.ProductAlreadyDeleted;
      return this.productRepo.softDelete(productId);
   }
   async getAllProduct(pagination: Pagination, findOption: FindOptionDTO) {
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

      return {
         products: products.map((product) => {
            return ProductResDTO.fromEntity(product);
         }),
         pagination,
      };
   }

   // etc...
   async getAllCategory() {
      // const categories = await categoryModel.find({}).lean()
      return categoryModel.find({}).lean();
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
}
