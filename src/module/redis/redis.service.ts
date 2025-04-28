import Redis from "ioredis";
import { Service } from "typedi";
@Service()
export class RedisService {
   private redis;
   constructor() {
      this.redis = new Redis();
   }
   // constructor
   async setKey(key: string, value: string, seconds: number) {
      return await this.redis.set(key, value, "EX", seconds);
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
   async getKeys(pattern: string): Promise<string[]> {
      let cursor = "0";
      let keys: string[] = [];

      do {
         const result = await this.redis.scan(
            cursor,
            "MATCH",
            pattern,
            "COUNT",
            100
         );
         cursor = result[0];
         keys = [...keys, ...result[1]];
      } while (cursor !== "0");

      return keys;
   }
}
