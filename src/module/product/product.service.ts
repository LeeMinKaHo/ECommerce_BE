import { Types } from "mongoose";
import { Inject, Service } from "typedi";
import { Pagination } from "../shared/dto/pagination.dto";
import { Error } from "../shared/error/error-custom";
import { UserService } from "../user/user.service";
import { CreateProductDTO } from "./dto/create-product.dto";
import { FindOptionDTO, SortOption } from "./dto/find-option.dto";
import { ProductResDTO } from "./dto/product-res.dto";
import { SearchProductDTO } from "./dto/search-product.dto";
import categoryModel from "./model/category.model";
import productSizeModel from "./model/product-variant.model";
import productModel from "./model/product.model";

@Service()
export class ProductService {
   constructor(@Inject() private userService: UserService) {}
   async createProduct(createProductDTO: CreateProductDTO, email: string) {
      // const session = await mongoose.startSession();
      // session.startTransaction();
      // const { _id } = await this.userService.findUserByEmail(email);
      // try {
      //    const { variants, ...productData } = createProductDTO;
      //    // 1. Tạo sản phẩm
      //    const product = await productModel.create([productData], { session });
      //    const productId = product[0]._id;

      //    // 2. Tạo biến thể
      //    const variantDocs = variants.map((v) => ({
      //       ...v,
      //       productId,
      //    }));

      //    await productVariantModel.insertMany(variantDocs, { session });
      //    await session.commitTransaction();
      //    session.endSession();
      //    const newProduct = await productModel.create(createProductDTO);
      //    await newProduct.save();
      //    return newProduct.toObject();
      // } catch (err) {
      //    await session.abortTransaction();
      //    session.endSession();
      //    return false;
      // }
      const newProduct = await productModel.create(createProductDTO);
      return await newProduct.save();
   }
   async getProductDetail(productId: string) {
      const product = await productModel
         .findOne({ _id: productId, isDeleted: false })
         .populate("categoryId");

      if (!product) throw Error.ProductNotFound;

      const getUniqueValues = <T>(arr: T[]) => [...new Set(arr)];

      const colors = getUniqueValues(product.variants.map((v) => v.color));
      const sizes = getUniqueValues(product.variants.map((v) => v.size));

      return { product, colors, sizes };
   }

   async getAllProduct(pagination: Pagination, findOption: FindOptionDTO) {
      const { categoryId, minPrice, maxPrice, sort } = findOption;
      const filter: any = {};

      if (categoryId) {
         filter.categoryId = categoryId;
      }
      if (minPrice) {
         filter.price = { $gte: minPrice };
      }
      if (maxPrice) {
         filter.price = { $lte: maxPrice };
      }

      let query = productModel.find(filter);

      switch (sort) {
         case SortOption.Price_Asc:
            query = query.sort({ price: 1 });
            break;
         case SortOption.Price_Desc:
            query = query.sort({ price: -1 });
            break;
         case SortOption.Rating_Asc:
            query = query.sort({ rating: 1 });
            break;
         case SortOption.Rating_Desc:
            query = query.sort({ rating: -1 });
            break;
      }
      const products = await query
         .skip(pagination.getOffSet())
         .limit(pagination.limit)
         .where({ isDeleted: false }) // Lọc sản phẩm không bị xóa
         .populate("categoryId");

      pagination.total = await productModel.countDocuments(filter);

      return {
         products: products.map((product) => {
            return ProductResDTO.fromEntity(product);
         }),
         pagination,
      };
   }
   async getProduct(productId: string) {
      const product = await productModel.findById(productId);
      if (!product) {
         throw Error.ProductNotFound;
      }
      return product;
   }
   async checkProductActive(productId: string) {
      const product = await this.getProduct(productId);
      if (product.isDeleted == true) {
         throw Error.ProductNotActive;
      }
      return product;
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
   async deleteProduct(productId: string) {
      const product = await this.checkProductActive(productId);
      product.isDeleted = true;
      return await product.save();
   }
   async checkProductVariantExist(productVariantId: string) {
      const product = await productModel.findOne({
         "variants._id": productVariantId,
      }); 
      return !!product; 
   }
}
