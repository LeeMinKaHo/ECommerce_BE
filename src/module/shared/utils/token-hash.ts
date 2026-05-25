import crypto from "crypto";

export function sha256Base64Url(input: string): string {
   // Store hashed tokens in Redis to reduce blast radius
   return crypto.createHash("sha256").update(input).digest("base64url");
}

