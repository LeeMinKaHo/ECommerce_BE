import { Router } from "express";
import { Inject, Service } from "typedi";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { AuthorizeMiddleware } from "../auth/auth.middleware";
import { userRole } from "../user/user.types";
@Service()
export class ProductRouter {
   private router;
   constructor(
      @Inject() private productController: ProductController,
      @Inject() private authMiddleware: AuthorizeMiddleware
   ) {
      this.router = Router();
      this.initalizeRouter();
   }
   initalizeRouter() {
      this.router.post(
         "/",
         this.authMiddleware.authorize,
         this.authMiddleware.authorizeRoles(userRole.Admin),
         this.productController.createProduct.bind(this.productController)
      );
      this.router.get("/",this.productController.getProducts.bind(this.productController)),
      this.router.get("/categories", this.productController.getCategory.bind(this.productController))
      this.router.get(
         "/sizes",
         this.productController.getAllSizes.bind(this.productController)
      );
      this.router.get("/:productId", this.productController.getProduct.bind(this.productController))
      this.router.get("/similar/:productId", this.productController.getSimilarProducts.bind(this.productController))
      this.router.delete(
         "/:productId",this.productController.deleteProduct.bind(this.productController)
      );
      this.router.put(
         "/:productId",
         this.authMiddleware.authorize,
         this.authMiddleware.authorizeRoles(userRole.Admin),
         this.productController.updateProduct.bind(this.productController)
      );
      
   }
   getRouter() {
      return this.router;
   }
}
