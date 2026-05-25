import express from "express";
import path from "path";
import { setupMiddleware } from "./middleware";
import { setupRoutes } from "./routes";

export const createApp = () => {
  const app = express();

  app.use(express.static(path.join(__dirname, "../public")));

  setupMiddleware(app);
  setupRoutes(app);

  return app;
};

export default createApp;