import { Service } from 'typedi';
import { paypal, paypalClient } from './paypal';
import { logger } from '../shared/middleware/logger';

@Service()
export class PayPalService {
  async createPayment(amount: number, currency: string): Promise<string> {
    try {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: this.buildPurchaseUnits(amount, currency),
      });

      const order = await paypalClient.execute(request);
      logger.info('[PayPal] Order created', { orderId: order.result.id });
      return order.result.id;
    } catch (err) {
      logger.error('[PayPal] Failed to create order', { error: err.message });
      throw new Error('Create PayPal payment failed: ' + err.message);
    }
  }

  async executePayment(orderId: string) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});
      const response = await paypalClient.execute(request);
      logger.info('[PayPal] Order captured', {
        orderId,
        status: response.result?.status,
      });
      return response.result;
    } catch (err) {
      logger.error('[PayPal] Failed to capture order', {
        orderId,
        error: err.message,
      });
      throw new Error('Capture PayPal payment failed: ' + err.message);
    }
  }

  private buildPurchaseUnits(amount: number, currency: string) {
    return [
      {
        amount: {
          currency_code: currency,
          value: amount.toFixed(2), // đảm bảo format đúng (ví dụ: "10.00")
        },
        description: 'Order payment',
      },
    ];
  }
}
