-- Add street address, ST location tracking, and address completeness flag to Lead
ALTER TABLE "Lead" ADD COLUMN "street" TEXT;
ALTER TABLE "Lead" ADD COLUMN "stLocationId" TEXT;
ALTER TABLE "Lead" ADD COLUMN "addressComplete" BOOLEAN;
