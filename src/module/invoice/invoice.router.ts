import { Router } from 'express';
import { Inject, Service } from 'typedi';
import { AuthorizeMiddleware } from '../auth/auth.middleware';
import { InvoiceController } from './invoice.controller';

@Service()
export class InvoiceRouter {
  private router: Router;

  constructor(
    @Inject() private invoiceController: InvoiceController,
    @Inject() private authMiddleware: AuthorizeMiddleware
  ) {
    this.router = Router();
    this.initializeRouter();
  }

  private initializeRouter() {
    const ctrl = this.invoiceController;
    const auth = this.authMiddleware.authorize;

    // ✅ Static routes PHẢI đứng TRƯỚC dynamic routes (/:param)
    // để tránh bị Express khớp nhầm

    // Admin: Lấy tất cả hóa đơn
    this.router.get('/', auth, ctrl.getInvoice.bind(ctrl));

    // User: Lấy hóa đơn của chính mình
    // ⚠️ /user/me phải TRƯỚC /:invoiceId
    this.router.get('/user/me', auth, ctrl.getInvoicesByUser.bind(ctrl));

    // Lấy hóa đơn theo ID
    this.router.get('/:invoiceId', ctrl.getInvoiceById.bind(ctrl));

    // Tạo hóa đơn từ giỏ hàng
    this.router.post('/', auth, ctrl.createInvoice.bind(ctrl));

    // Capture thanh toán PayPal
    this.router.post(
      '/capture/:paypalOrderId',
      auth,
      ctrl.captureInvoice.bind(ctrl)
    );

    // Admin: Cập nhật trạng thái hóa đơn
    this.router.put('/:invoiceId', auth, ctrl.updateInvoiceStatus.bind(ctrl));
  }

  getRouter() {
    return this.router;
  }
}
