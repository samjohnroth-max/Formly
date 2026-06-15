-- Add ClientStatus enum and status field to Client table

CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'DISABLED');

ALTER TABLE "Client" ADD COLUMN "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';
