-- AlterTable: add unique constraint on EmailTemplate(accountId, name)
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_accountId_name_key" UNIQUE ("accountId", "name");
