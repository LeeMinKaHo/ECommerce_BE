import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";
import { RedisService } from "../../redis/redis.service";
import { ErrorCustom } from "../errors/error-custom";

type RateLimitOptions = {
   windowSeconds: number;
   maxAttempts: number;
   keyPrefix: string;
};

@Service()
export class LoginRateLimitMiddleware {
   constructor(@Inject() private redis: RedisService) {}

   /**
    * Redis-backed fixed-window limiter.
    * Good enough for login brute-force throttling without new deps.
    */
   limit =
      (options: RateLimitOptions) =>
      async (req: Request, _res: Response, next: NextFunction) => {
         try {
            const ip =
               (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ??
               req.socket.remoteAddress ??
               "unknown";
            const email =
               typeof req.body?.email === "string" ? req.body.email.toLowerCase() : "unknown";

            const key = `${options.keyPrefix}:${ip}:${email}`;

            const currentRaw = await this.redis.getKey(key);
            const current = currentRaw ? Number(currentRaw) : 0;

            if (Number.isNaN(current)) {
               // reset corrupted values
               await this.redis.setKey(key, "1", options.windowSeconds);
               return next();
            }

            if (current >= options.maxAttempts) {
               return next(
                  new ErrorCustom(
                     "TOO_MANY_ATTEMPTS",
                     "Too many login attempts. Please try again later.",
                     429
                  )
               );
            }

            // increment; keep ttl aligned to window
            await this.redis.setKey(key, String(current + 1), options.windowSeconds);
            return next();
         } catch (e) {
            // fail-open to avoid locking users out if Redis is down
            return next();
         }
      };
}

