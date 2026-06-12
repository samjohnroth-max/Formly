-- AlterTable: add config JSON to EmailTemplate
ALTER TABLE "EmailTemplate" ADD COLUMN "config" JSONB;

-- CreateTable: BrandSettings
CREATE TABLE "BrandSettings" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT '',
    "primaryColor" TEXT NOT NULL DEFAULT '#2563eb',
    "secondaryColor" TEXT NOT NULL DEFAULT '#f3f4f6',
    "logoUrl" TEXT NOT NULL DEFAULT '',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "buttonStyle" TEXT NOT NULL DEFAULT 'rounded',
    "footerText" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrandSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandSettings_accountId_key" ON "BrandSettings"("accountId");

-- AddForeignKey
ALTER TABLE "BrandSettings" ADD CONSTRAINT "BrandSettings_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
