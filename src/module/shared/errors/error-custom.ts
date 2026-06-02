import { Response } from "express";
import { ResponseCustom } from "../response-custom";
import { ValidationError } from "class-validator";

export class ErrorCustom {
   code: string;
   message: string;
   status: number;
   constructor(code: string, message: string, status: number = 400) {
      this.code = code;
      this.message = message;
      this.status = status;
   }
}
export const Error = {
   IncorrectPass: new ErrorCustom("IncorrectPassword", "Incorrect password"),
   BadRequest: new ErrorCustom("BadRequest", "Bad Request", 400),
   ServerError: new ErrorCustom("ServerError", "Server Error", 500),
   UserNotFound: new ErrorCustom("UserNotFound", "User Not Found"),
   UnAuthorize: new ErrorCustom("UnAuthorize", "Unauthorized", 401),
   accessTokenInvalid: new ErrorCustom(
      "AccessTokenInvalid",
      "AccessToken Invalid",
      401
   ),
   refreshTokenInvalid: new ErrorCustom(
      "RefreshTokenInvalid",
      "RefreshToken Invalid",
      401
   ),
   CodeNotValid: new ErrorCustom("CodeNotValid", "Code not valid"),
   UserNotActive: new ErrorCustom("UserNotActive", "User not active", 403),
   UserAlreadyActive: new ErrorCustom(
      "UserAlreadyActivce",
      "User already active"
   ),

   // **************************** POST *******************************************
   ProductNotFound: new ErrorCustom("ProductNotFound", "Product not found"),
   ProductNotActive: new ErrorCustom("ProductNotActive", "Product not active"),
   ProductAlreadyDeleted: new ErrorCustom(
      "ProductAlreadyDeleted",
      "Product already deleted"
   ),
   ProductVariantNotFound: new ErrorCustom(
      "ProductVariantNotFound",
      "Product variant not found"
   ),
   // **************************** Invoice *******************************************
   InvoiceNotFound: new ErrorCustom("InvoiceNotFound", "Invoice not found"),
   InvoiceAlreadyPending: new ErrorCustom("InvoiceAlreadyPending", "You already have a pending order. Please complete or cancel it first.", 409),
   InvoiceAlreadyCaptured: new ErrorCustom("InvoiceAlreadyCaptured", "This order has already been paid.", 409),
   // **************************** Cart *******************************************
   CartIsEmpty: new ErrorCustom("CartIsEmpty", "Cart is empty"),
   OutOfStock: new ErrorCustom("OutOfStock", "One or more items in your cart are out of stock", 409),
   // **************************** User *******************************************
   NotBelongUser: new ErrorCustom(
      "Thisnotbelongtouser",
      "This not belong to user"
   ),
   Forbidden: new ErrorCustom("Forbidden", "Forbidden", 403),
};
export const handleError = (err: ErrorCustom, res: Response) => {
   console.log(err);
   if (Array.isArray(err) && err[0] instanceof ValidationError) {
      const firstError = err[0];
      const firstMessage =
         Object.values(firstError.constraints || {})[0] || "Validation error";
      const validationError = new ErrorCustom(
         "VALIDATION_ERROR",
         firstMessage,
         400
      );
      return res
         .status(400)
         .json(new ResponseCustom(null, validationError, null));
   }
   // 2. Custom app error
   if (err instanceof ErrorCustom) {
      return res
         .status(err.status ?? 400)
         .json(new ResponseCustom(null, err, null));
   }
   // 3. Unknown or system error
   const internalError = new ErrorCustom(
      "INTERNAL_SERVER_ERROR",
      typeof err === "string" ? err : JSON.stringify(err),
      500
   );
   return res.status(500).json(new ResponseCustom(null, internalError, null));
};
