import Redis from "ioredis";
import { Service } from "typedi";
@Service()
export class RedisService {
   private redis;
   constructor() {
      this.redis = new Redis();
   }
   private prefixKey(type: string, key: string) {
      return `${type}:${key}`;
   }
   // constructor
   async setKey(key: string, value: string, seconds?: number) {
      if (seconds) {
         return await this.redis.set(key, value, "EX", seconds);
      }
      return await this.redis.set(key, value);
   }

   async deleteKey(key: string): Promise<boolean> {
      const result = await this.redis.del(key);
      return result > 0; // Trả về true nếu xóa thành công, false nếu key không tồn tại
   }

   // Kiểm tra xem key có tồn tại không
   async checkExistedKey(key: string): Promise<boolean> {
      const result = await this.redis.exists(key);
      return result === 1; // Trả về true nếu key tồn tại, false nếu không
   }
   async getKey(key: string): Promise<string | null> {
      return await this.redis.get(key);
   }
   async flushAll(): Promise<void> {
      await this.redis.flushall();
   }

   async deleteByPrefix(prefix: string): Promise<void> {
      const stream = this.redis.scanStream({
         match: `${prefix}*`,
      });

      stream.on("data", (keys: string[]) => {
         if (keys.length > 0) {
            this.redis.del(...keys);
         }
      });

      return new Promise((resolve) => {
         stream.on("end", () => resolve());
      });
   }
   async setObject<T>(key: string, value: T, seconds?: number) {
      const stringValue = JSON.stringify(value);
      return await this.setKey(key, stringValue, seconds);
   }

   async getObject<T>(key: string): Promise<T | null> {
      const result = await this.getKey(key);
      return result ? (JSON.parse(result) as T) : null;
   }
}
