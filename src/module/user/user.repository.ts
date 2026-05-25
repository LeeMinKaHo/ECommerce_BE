import { Service } from "typedi";
import userModel, { IUser } from "./model/user.model";

@Service()
export class UserRepository {
   async findByEmail(email: string) {
      return userModel.findOne({ email });
   }

   async findById(id: string) {
      return userModel.findById(id);
   }

   async updateById(id: string, update: Partial<IUser>) {
      return userModel.updateOne({ _id: id }, { $set: update });
   }
}

