import { Response, NextFunction } from "express";
import { Inject, Service } from "typedi";
import { NotificationService } from "./notification.service";
import { ResponseCustom } from "../shared/response-custom";
import { AuthRequest } from "../auth/auth.types";
import { UserService } from "../user/user.service";

@Service()
export class NotificationController {
    constructor(
        @Inject() private notificationService: NotificationService,
        @Inject() private userService: UserService
    ) { }

    async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findUserByEmail(req.payload.email);
            const userId = user._id.toString();
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const data = await this.notificationService.getNotifications(userId, page, limit);
            res.status(200).json(new ResponseCustom(data, null, null));
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findUserByEmail(req.payload.email);
            await this.notificationService.markAllAsRead(user._id.toString());
            res.status(200).json(new ResponseCustom({ success: true }, null, null));
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findUserByEmail(req.payload.email);
            const { id } = req.params;
            await this.notificationService.markAsRead(id, user._id.toString());
            res.status(200).json(new ResponseCustom({ success: true }, null, null));
        } catch (error) {
            next(error);
        }
    }

    async countUnread(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await this.userService.findUserByEmail(req.payload.email);
            const count = await this.notificationService.countUnread(user._id.toString());
            res.status(200).json(new ResponseCustom({ count }, null, null));
        } catch (error) {
            next(error);
        }
    }
}
