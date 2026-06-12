-- CreateEnum
CREATE TYPE "TriggerType" AS ENUM ('IMMEDIATE', 'HOURS_AFTER', 'BOOKING_CONFIRMED', 'JOB_COMPLETE');

-- CreateTable
CREATE TABLE "CampaignEmailSequence" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "triggerDelay" INTEGER NOT NULL DEFAULT 0,
    "emailTemplateId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignEmailSequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignEmailSequence_campaignId_stepNumber_key" ON "CampaignEmailSequence"("campaignId", "stepNumber");

-- CreateIndex
CREATE INDEX "CampaignEmailSequence_campaignId_idx" ON "CampaignEmailSequence"("campaignId");

-- AddForeignKey
ALTER TABLE "CampaignEmailSequence" ADD CONSTRAINT "CampaignEmailSequence_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignEmailSequence" ADD CONSTRAINT "CampaignEmailSequence_emailTemplateId_fkey"
    FOREIGN KEY ("emailTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
