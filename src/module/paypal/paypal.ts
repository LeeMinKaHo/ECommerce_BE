import paypal from '@paypal/checkout-server-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error(
    '[PayPal] Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in environment variables'
  );
}

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

export { paypal, paypalClient };
