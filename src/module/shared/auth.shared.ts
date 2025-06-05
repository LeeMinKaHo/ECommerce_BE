import { PayLoad } from "../auth/auth.types";

export const timeExpire = {
   accessToken: 100000,
   refreshToken: 30000,
   verifyCode: 300,
};
export const Keys = {
   accessToken(userId: string) {
      return `access_token:${userId}`;
   },
   refreshToken(userId: string) {
      return `refresh_token:${userId}`;
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
