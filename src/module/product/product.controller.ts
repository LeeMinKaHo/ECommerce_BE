import { Inject, Service } from "typedi";
import { ProductService } from "./product.service";
import { NextFunction, Request, Response } from "express";
import { CreateProductDTO } from "./dto/create-product.dto";
import { json } from "stream/consumers";
import { ResponseCustom } from "../shared/response-custom";
import { AuthRequest } from "../auth/auth.types";
import { Pagination } from "../shared/dto/pagination.dto";
import { QueueManager } from "../bullmq/queue-manager";
import { assert } from "console";
@Service()
export class ProductController {
   constructor(
      @Inject() private productService: ProductService,
      
   ) {}
   async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
      try {
         const payload = req.payload;
         const createProductDTO = CreateProductDTO.fromRequest(req.body);
         const data = await this.productService.createProduct(
            createProductDTO,
            payload
         );
         res.json(new ResponseCustom(data, null, null));
      } catch (error) {
         next(error);
      }
   }
   async getProducts(req: Request, res: Response, next: NextFunction) {
      try {

         const { products, pagination } =
            await this.productService.getAllProduct(
               Pagination.fromRequest(req)
            );
         res.json(new ResponseCustom(products, null, pagination));
      } catch (error) {
         next(error);
      }
   }
   async getProduct(req: Request, res: Response, next: NextFunction) {
      const { productId } = req.params;
    
      const product = await this.productService.getProduct(productId);
      res.json(new ResponseCustom(product, null, null));
   }
   async getCategory(req: Request, res: Response, next: NextFunction) {
      const categories = await this.productService.getAllCategory();
      res.json(new ResponseCustom(categories, null, null));
   }
}
