import { validateOrReject } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { AddCartDTO } from "./dto/add-cart.dto";
import { UpdateCartDTO } from "./dto/update-cart.dto";

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

export const validateUpdateCart = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const dto = UpdateCartDTO.fromRequest({ cartItemId: req.params.cartId, quantity: req.body.quantity });
      await validateOrReject(dto);
      next();
   } catch (error) {
      next(error);
   }
};
