import { PayLoad } from "../auth/auth.types";

export const timeExpire = {
   // seconds
   accessToken: 60 * 15, // 15 minutes
   refreshToken: 60 * 60 * 24 * 30, // 30 days
   verifyCode: 300,
};
export const Keys = {
   accessToken(userId: string) {
      return `access_token:${userId}`;
   },
   refreshToken(userId: string) {
      return `refresh_token:${userId}`;
   },
   refreshJti(userId: string) {
      return `refresh_jti:${userId}`;
   },
   verificationCode(userId: string) {
      return `verify:${userId}`;
   },
   allUserAccessToken(userId: number) {
      return `auth:access:${userId}:*`;
   },
   allUserRefreshToken(userId: number) {
      return `auth:refresh:${userId}:*`;
   },
};
