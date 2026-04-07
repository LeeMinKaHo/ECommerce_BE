import { Service } from "typedi";
import invoiceModel from "../invoice/model/invoice.model";
import productModel from "../product/model/product.model";
import userModel from "../user/model/user.model";
@Service()
export class ReportService {
   async overview() {
      // ❗ Cần await ở đây
      const totalUsers = await userModel.countDocuments();
      const totalInvoices = await invoiceModel.countDocuments();
      const totalProducts = await productModel.countDocuments();

      const totalRevenueAgg = await invoiceModel.aggregate([
         { $match: { status: "completed" } },
         { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      return {
         totalUsers,
         totalInvoices,
         totalProducts,
         totalRevenue: totalRevenueAgg[0]?.total || 0,
      };
   }
}
