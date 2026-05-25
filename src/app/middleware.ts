import { Express } from "express";
import cors from "cors";
import { requestLogger } from "src/module/shared/middleware/request-log.middleware";
import { handleError } from "src/module/shared/errors/error-custom";
import express from "express";
import cookieParser from "cookie-parser";

export const setupMiddleware = (app: Express) => {
  app.use(express.json());
  app.use(cookieParser());

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(requestLogger);

  // error handler
  app.use((err: any, req: any, res: any, next: any) => {
    handleError(err, res);
  });
};