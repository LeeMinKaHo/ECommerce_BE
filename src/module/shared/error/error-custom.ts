import { Response } from "express";
import { ResponseCustom } from "../response-custom";


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
   IncorrectPass : new ErrorCustom("IncorrectPassword" ,"Incorrect password"),
   BadRequest: new ErrorCustom("BadRequest", "Bad Request", 500),
   ServerError: new ErrorCustom("ServerError", "Server Error", 500),
   UserNotFound: new ErrorCustom("UserNotFound", "User Not Found"),
   UnAuthorize: new ErrorCustom("UnAuthorize", "UnAuthorize", 403),
   accessTokenInvalid: new ErrorCustom(
      "AccessTokenInvalid",
      "AccessToken Invalid",
      500
   ),
   refreshTokenInvalid: new ErrorCustom(
      "RefreshTokenInvalid",
      "RefreshToken Invalid",
      500
   ),
   CodeNotValid : new ErrorCustom("CodeNotValid" , "Code not valid"),
   UserNotActive: new ErrorCustom("UserNotActive", "User not active", 500),
   UserAlreadyActive : new ErrorCustom("UserAlreadyActivce", "User already active"),

   // **************************** POST *******************************************
   ProductNotFound : new ErrorCustom("ProductNotFound" , "Product not found"),
   ProductNotActive : new ErrorCustom("ProductNotActive" , "Product not active"),
   // **************************** Invoice *******************************************
   InvoiceNotFound : new ErrorCustom("InvoiceNotFound" , "Invoice not found"),
   // **************************** Cart *******************************************
   CartIsEmpty : new ErrorCustom("CartIsEmpty" , "Cart is empty"),
   // **************************** User *******************************************
   NotBelongUser : new ErrorCustom("Thisnotbelongtouser" , "This not belong to user"),
   Forbidden : new ErrorCustom("Forbidden" , "Forbidden", 403),

};
export const handleError = (err: ErrorCustom, res: Response) => {
   console.log(err);
   if (err instanceof ErrorCustom) {
      res.status(err.status | Error.BadRequest.status).json(
         new ResponseCustom(null, err, null)
      );
   } else {
      const error = new ErrorCustom(
         Error.ServerError.code,
         JSON.stringify(err),
         Error.ServerError.status
      );
      res.status(500).json(new ResponseCustom(null, error, null));
   }
};
