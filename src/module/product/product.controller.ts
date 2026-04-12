import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";
import { AuthRequest } from "../auth/auth.types";
import { Pagination } from "../shared/dto/pagination.dto";
import { ResponseCustom } from "../shared/response-custom";
import { CreateProductDTO } from "./dto/create-product.dto";
import { ProductService } from "./product.service";
import { FindOptionDTO } from "./dto/find-option.dto";
@Service()
export class ProductController {
   constructor(@Inject() private productService: ProductService) {}
   async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const { email } = req.payload;
         const createProductDTO = CreateProductDTO.fromRequest(req.body);
         const data = await this.productService.createProduct(createProductDTO , email);
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }
   async getProducts(req: Request, res: Response, next: NextFunction) {
      try {
         const { products, pagination } =
            await this.productService.getAllProduct(
               Pagination.fromRequest(req),
               FindOptionDTO.fromRequest(req)
            );
         res.json(new ResponseCustom(products, null, pagination));
      } catch (error) {
         next(error);
      }
   }
   async getProduct(req: Request, res: Response, next: NextFunction) {
      try {
         const { productId } = req.params;
         const product = await this.productService.getProductDetail(productId);
         res.json(new ResponseCustom(product, null, null));
      } catch (error) {
         next(error);
      }
   }
   async getCategory(req: Request, res: Response, next: NextFunction) {
      try {
         const categories = await this.productService.getAllCategory();
         res.json(new ResponseCustom(categories, null, null));
      } catch (error) {
         next(error);
      }
   }
   async deleteProduct(req: Request, res: Response, next: NextFunction) {
      try {
         const { productId } = req.params;
         const data = await this.productService.deleteProduct(productId);
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }
   async getAllSizes(req: Request, res: Response, next: NextFunction) {
      try {
         const sizes = await this.productService.getAllSizes();
         res.json(new ResponseCustom(sizes, null, null));
      } catch (error) {
         next(error);
      }
   }

   async getSimilarProducts(req: Request, res: Response, next: NextFunction) {
      try {
         const { productId } = req.params;
         const products = await this.productService.getSimilarProducts(productId);
         res.json(new ResponseCustom(products, null, null));
      } catch (error) {
         next(error);
      }
   }

   async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const { productId } = req.params;
         const data = await this.productService.updateProduct(productId, req.body);
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }

   async syncEmbeddings(req: Request, res: Response, next: NextFunction) {
      try {
         const data = await this.productService.syncEmbeddings();
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }
}
