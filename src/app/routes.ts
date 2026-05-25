import { Express } from "express";
import cartRouter from "src/module/cart/cart.router";
import wishlistRouter from "src/module/wishlist/wishlist.router";
import { Container } from "typedi";
import { InvoiceRouter } from "src/module/invoice/invoice.router";
import uploadRoutes from "src/module/upload/upload.route";
import { ReportRouter } from "src/module/report/report.router";
import { NotificationRouter } from "src/module/notification/notification.router";
import { UserRouter } from "src/module/user/user.router";
import { ProductRouter } from "src/module/product/product.router";
import { ReviewRouter } from "src/module/reviews/review.router";

export const setupRoutes = (app: Express) => {
  app.use("/users", Container.get(UserRouter).getRouter());
  app.use("/products", Container.get(ProductRouter).getRouter());
  app.use("/reviews", Container.get(ReviewRouter).getRouter());
  app.use("/carts", cartRouter);
  app.use("/invoices", Container.get(InvoiceRouter).getRouter());
  app.use("/api/upload", uploadRoutes);
  app.use("/admin", Container.get(ReportRouter).getRouter());
  app.use("/notifications", Container.get(NotificationRouter).getRouter());
  app.use("/wishlist", wishlistRouter);
};