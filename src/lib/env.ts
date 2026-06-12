/**
 * Validates required environment variables at startup.
 * Import this module early (it runs on first import) to fail fast
 * with a clear error instead of a cryptic crash mid-request.
 */

const REQUIRED_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXTAUTH_URL",
  "ENCRYPTION_KEY",
  "REDIS_URL",
  "META_APP_ID",
  "META_APP_SECRET",
  "META_REDIRECT_URI",
  "META_WEBHOOK_VERIFY_TOKEN",
] as const;

function validateEnv() {
  // Skip in test environments
  if (process.env.NODE_ENV === "test") return;

  const missing = REQUIRED_VARS.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(
      `[formly] Missing required environment variables:\n` +
        missing.map((k) => `  - ${k}`).join("\n") +
        `\n\nSee .env.production.example for reference.`
    );
  }

  // Validate ENCRYPTION_KEY is exactly 64 hex chars (32 bytes)
  const key = process.env.ENCRYPTION_KEY!;
  if (key && !/^[0-9a-f]{64}$/i.test(key)) {
    throw new Error(
      `[formly] ENCRYPTION_KEY must be a 64-character hex string. ` +
        `Generate one with: openssl rand -hex 32`
    );
  }
}

validateEnv();
