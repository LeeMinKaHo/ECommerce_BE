import { Router } from "express";
import Container from "typedi";
import { WishlistController } from "./wishlist.controller";
import { AuthorizeMiddleware } from "../auth/auth.middleware";

const wishlistRouter = Router();
const wishlistController = Container.get(WishlistController);
const authMiddleware = Container.get(AuthorizeMiddleware);

wishlistRouter.post(
  "/toggle",
  authMiddleware.authorize,
  wishlistController.toggle.bind(wishlistController)
);

wishlistRouter.get(
  "/",
  authMiddleware.authorize,
  wishlistController.getMyWishlist.bind(wishlistController)
);

wishlistRouter.get(
  "/status/:productId",
  authMiddleware.authorize,
  wishlistController.checkStatus.bind(wishlistController)
);

export default wishlistRouter;
