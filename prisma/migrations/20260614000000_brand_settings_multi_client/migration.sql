-- Add ESTIMATE to DestinationType enum
-- Note: ALTER TYPE ADD VALUE cannot run inside a transaction in PostgreSQL < 12.
-- Railway uses PG 14+, so this is safe within the Prisma migration transaction.
ALTER TYPE "DestinationType" ADD VALUE IF NOT EXISTS 'ESTIMATE';

-- Add multi-client fields to BrandSettings
ALTER TABLE "BrandSettings" ADD COLUMN IF NOT EXISTS "clientId" TEXT;
ALTER TABLE "BrandSettings" ADD COLUMN IF NOT EXISTS "replyToEmail" TEXT;

-- FK: BrandSettings.clientId → Client.id
ALTER TABLE "BrandSettings" ADD CONSTRAINT "BrandSettings_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE
  NOT VALID;

ALTER TABLE "BrandSettings" VALIDATE CONSTRAINT "BrandSettings_clientId_fkey";

-- Drop old single-column unique constraint on accountId
ALTER TABLE "BrandSettings" DROP CONSTRAINT IF EXISTS "BrandSettings_accountId_key";

-- Partial unique index: only one default (clientId IS NULL) per account
CREATE UNIQUE INDEX IF NOT EXISTS "BrandSettings_account_default_uidx"
  ON "BrandSettings"("accountId") WHERE "clientId" IS NULL;

-- Partial unique index: only one entry per (accountId, clientId) when clientId is set
CREATE UNIQUE INDEX IF NOT EXISTS "BrandSettings_account_client_uidx"
  ON "BrandSettings"("accountId", "clientId") WHERE "clientId" IS NOT NULL;

-- Regular index for perf
CREATE INDEX IF NOT EXISTS "BrandSettings_accountId_clientId_idx"
  ON "BrandSettings"("accountId", "clientId");
