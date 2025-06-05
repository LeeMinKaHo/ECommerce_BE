import { validateOrReject } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { AddCartDTO } from "./dto/add-cart.dto";

export const validateCreateCart = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      console.log("validateCreateCart", req.body);
      await validateOrReject(AddCartDTO.fromRequest(req.body));
      next();
   } catch (error) {
      next(error);
   }
};
