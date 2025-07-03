import { validateOrReject } from "class-validator";
import { NextFunction } from "express";
import { LoginDTO } from "./dtos/login.dto";
import {Request , Response} from 'express'
export const validateLoginDTO = async (
   req: Request,
   res: Response,
   next: NextFunction
) => {
   try {
      const loginDTO = LoginDTO.fromRequest(req.body);
      await validateOrReject(loginDTO);
   } catch (error) {
      next(error);
   }
};
