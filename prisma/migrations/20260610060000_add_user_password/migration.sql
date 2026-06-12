-- AlterTable: add nullable password field to User for credentials auth
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;
