import { Service } from "typedi";
import { paypal, paypalClient } from "./paypal";

@Service()
export class PayPalService {
   constructor() {
      // Có thể init thêm nếu cần
   }

   async createPayment(amount: number, currency: string) {
      try {
         const request = new paypal.orders.OrdersCreateRequest();
         request.prefer("return=representation");
         request.requestBody({
            intent: "CAPTURE",
            purchase_units: this.buildPurchaseUnits(amount, currency),
         });

         const order = await paypalClient.execute(request);
         console.log("👉 Raw PayPal create order response:", order); // log toàn bộ object
         console.log("👉 PayPal order result:", order.result); // log kết quả cụ thể
         return order.result.id;
      } catch (err) {
         // Log lỗi và ném exception để controller xử lý
         throw new Error("Create PayPal payment failed: " + err.message);
      }
   }
   private buildPurchaseUnits(amount: number, currency: string) {
      return [
         {
            amount: {
               currency_code: currency,
               value: amount.toString(),
            },
            description: "Thanh toán đơn hàng tại shop của chúng tôi",
         },
      ];
   }

   async executePayment(orderId: string) {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({}); // cần có body rỗng cho capture
      const response = await paypalClient.execute(request);
      return response.result;
   }
}
