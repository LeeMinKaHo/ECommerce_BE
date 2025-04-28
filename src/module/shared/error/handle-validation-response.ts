import { NextFunction } from "express";
import { ErrorCustom } from "./error-custom";
import mongoose from "mongoose";

export const handleErrorValidation = function (error, next: NextFunction) {
   
   if (error instanceof mongoose.Error.ValidationError) {
      try {
         const firstError = Object.values(
            error.errors
         )[0] as mongoose.Error.ValidatorError;
         console.log(firstError)
         const errorMessage = firstError.message || "Validation error";
         const errorValue = firstError.value ?? "Invalid input";

         const errorResponse = new ErrorCustom(errorValue, errorMessage);
         return next(errorResponse);
      } catch (err) {
         console.error("Error processing validation error:", err);
      }
   }
   next(error); 
};
