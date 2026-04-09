import { Service } from "typedi";
import invoiceModel from "../invoice/model/invoice.model";
import productModel from "../product/model/product.model";
import userModel from "../user/model/user.model";
import { InvoiceStatus } from "../invoice/model/invoice.model";

@Service()
export class ReportService {
   async overview() {
      const totalUsers = await userModel.countDocuments();
      const totalInvoices = await invoiceModel.countDocuments();
      const totalProducts = await productModel.countDocuments();

      const totalRevenueAgg = await invoiceModel.aggregate([
         { $match: { status: InvoiceStatus.COMPLETED } },
         { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);

      return {
         totalUsers,
         totalInvoices,
         totalProducts,
         totalRevenue: totalRevenueAgg[0]?.total || 0,
      };
   }

   async getRevenueStats(days: number = 7) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const stats = await invoiceModel.aggregate([
         {
            $match: {
               status: InvoiceStatus.COMPLETED,
               createdAt: { $gte: startDate },
            },
         },
         {
            $group: {
               _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
               revenue: { $sum: "$totalPrice" },
               count: { $sum: 1 },
            },
         },
         { $sort: { _id: 1 } },
      ]);

      // Fill in missing days with 0 revenue
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
         const date = new Date();
         date.setDate(date.getDate() - i);
         const dateString = date.toISOString().split("T")[0];
         const found = stats.find((s) => s._id === dateString);
         result.push({
           date: dateString.split("-").slice(1).reverse().join("/"), // DD/MM format
           revenue: found ? found.revenue : 0,
         });
      }

      return result;
   }
}
