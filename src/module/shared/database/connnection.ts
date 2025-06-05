import Redis from "ioredis";
import mongoose from "mongoose";
export const connectMongoDB = async () => {
   try {
      await mongoose.connect("mongodb://localhost:27017/Ecommerce", {
         replicaSet: "rs0", // Nếu bạn đang sử dụng Replica Set
         serverSelectionTimeoutMS: 5000, // Thời gian chờ để chọn server (ms)
         socketTimeoutMS: 45000, // Thời gian tối đa chờ kết nối tới server (ms)
      });
      console.log("Kết nối thành công");
   } catch (error) {
      console.log(error);
   }
};
export const connectionRedis = new Redis({
   host: "127.0.0.1",
   port: 6379,
   maxRetriesPerRequest: null,
});
