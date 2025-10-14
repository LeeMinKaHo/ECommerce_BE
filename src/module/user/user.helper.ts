import { Service } from "typedi";
import { Error } from "../shared/error/error-custom";
import userModel from "./model/user.model";

@Service()
export class UserHelper {
   async getUserIdByEmail(email: string): Promise<string> {
      const user = await userModel.findOne({ email });
      if (!user)   throw Error.UserNotFound;
      return user._id;
   }
}