import { Router } from "express";
import { Inject, Service } from "typedi";
import { NotificationController } from "./notification.controller";
import { AuthorizeMiddleware } from "../auth/auth.middleware";

@Service()
export class NotificationRouter {
    public router: Router;

    constructor(
        @Inject() private notificationController: NotificationController,
        @Inject() private authMiddleware: AuthorizeMiddleware
    ) {
        this.router = Router();
        this.initRoutes();
    }

    initRoutes() {
        const auth = this.authMiddleware.authorize;

        // GET /notifications        — lấy danh sách thông báo (có phân trang)
        this.router.get("/", auth, this.notificationController.getNotifications.bind(this.notificationController));

        // GET /notifications/unread — đếm thông báo chưa đọc
        this.router.get("/unread", auth, this.notificationController.countUnread.bind(this.notificationController));

        // PATCH /notifications/read-all — đánh dấu tất cả đã đọc
        this.router.patch("/read-all", auth, this.notificationController.markAllAsRead.bind(this.notificationController));

        // PATCH /notifications/:id/read — đánh dấu một thông báo đã đọc
        this.router.patch("/:id/read", auth, this.notificationController.markAsRead.bind(this.notificationController));
    }

    getRouter() {
        return this.router;
    }
}
