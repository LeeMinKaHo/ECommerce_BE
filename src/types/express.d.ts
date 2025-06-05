import { Request } from "express";

declare module "express" {
    export interface Request {
        user?: {
            id: string; // Hoặc kiểu dữ liệu phù hợp với ứng dụng của bạn
        };
    }
}