import { createLogger, transports, format } from "winston";
export const logger = createLogger({
   level: "info", // mặc định, có thể thay bằng 'debug' trong dev
   format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
   ),
   transports: [
      new transports.File({ filename: "logs/error.log", level: "error" }), // log lỗi
      new transports.File({ filename: "logs/combined.log" }), // log chung
   ],
});

// Nếu đang chạy trong môi trường dev thì log ra console luôn
// if (process.env.NODE_ENV !== "production") {
logger.add(
   new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
   })
);
//}
