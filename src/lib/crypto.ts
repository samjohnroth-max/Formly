import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;   // 96-bit IV (GCM standard)
const TAG_LENGTH = 16;  // 128-bit auth tag

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes). Generate with: openssl rand -hex 32");
  }
  return Buffer.from(key, "hex");
}

/** Encrypts plaintext → base64(iv[12] + authTag[16] + ciphertext) */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/** Decrypts a value produced by encrypt() */
export function decrypt(ciphertext: string): string {
  const buf = Buffer.from(ciphertext, "base64");
  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

/** Constant-time HMAC-SHA256 verification for webhook payloads */
export function verifyHmacSha256(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
