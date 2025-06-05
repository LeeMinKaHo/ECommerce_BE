import paypal from '@paypal/checkout-server-sdk';

const environment = new paypal.core.SandboxEnvironment(
  "AYBDGpA4Kf4kUZYeLd5-3A8RUlTpfCyrG8U0MrTq1rL8kEAxNDk1jqqX-UHre1WsGTIjA2l3zkE9wgR7",
  "ELGRMArGt8oqxdgQD1JSCHSbYtiBTHj-ird-isu6ZJYHlxkrtlrOmQ-e3U0xkltqykpGYVb8QKKONPMv"
);

const paypalClient = new paypal.core.PayPalHttpClient(environment);

export { paypal, paypalClient };
