import { Router } from "express";
import Container from "typedi";
import { CartController } from "./cart.controller";
import { AuthorizeMiddleware } from "../auth/auth.middleware";
import { validateCreateCart, validateUpdateCart } from "./cart.middleware";

const cartRouter = Router();
const cartController = Container.get(CartController);
const authMiddleware = Container.get(AuthorizeMiddleware);
cartRouter.post(
   "/",
   authMiddleware.authorize,
   validateCreateCart,
   cartController.addToCart.bind(cartController)
);
cartRouter.get(
   "/",
   authMiddleware.authorize,
   cartController.getCart.bind(cartController)
);
cartRouter.patch(
   "/:cartId",
   authMiddleware.authorize,
   validateUpdateCart,
   cartController.updateCartItem.bind(cartController)
);
cartRouter.delete(
   "/:cartId",
   authMiddleware.authorize,
   cartController.removeCartItem.bind(cartController)
);

export default cartRouter;
