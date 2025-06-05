import { Service } from "typedi";
import { paypal, paypalClient } from "./paypal";

@Service()
export class PayPalService {
   constructor() {
      // Có thể init thêm nếu cần
   }

   async createPayment(amount: number, currency: string) {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
         intent: "CAPTURE",
         purchase_units: [
            {
               amount: {
                  currency_code: currency,
                  value: amount.toString(),
               },
            },
         ],
      });

      const order = await paypalClient.execute(request);
      return order.result.id;
   }

   async executePayment(orderId: string) {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({}); // cần có body rỗng cho capture
      const response = await paypalClient.execute(request);
      return response.result;
   }
}
