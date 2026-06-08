import crypto from "crypto";

import { env } from "../../config/env.js";

const key = crypto.createHash("sha256").update(env.ENCRYPTION_SECRET).digest();
const algorithm = "aes-256-gcm";

export const encrypt = (value: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
};

export const decrypt = (value: string) => {
  const [ivHex, authTagHex, encryptedHex] = value.split(":");
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
};
