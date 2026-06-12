-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'PRO', 'AGENCY');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'ERROR', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "DestinationType" AS ENUM ('BOOKING', 'LEAD', 'FOLLOWUP');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RoutingStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'RETRY');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "CAPIStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateTable
CREATE TABLE "orgs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'STARTER',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orgs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "email" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "MetaConnection" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "metaAccountId" TEXT NOT NULL,
    "metaAccountName" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "pixelId" TEXT,
    "datasetId" TEXT,
    "status" "ConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetaConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "STConnection" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tenantName" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "appKey" TEXT NOT NULL,
    "accessToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "status" "ConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "STConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "metaConnectionId" TEXT NOT NULL,
    "stConnectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "metaFormId" TEXT NOT NULL,
    "metaFormName" TEXT NOT NULL,
    "metaAdAccountId" TEXT NOT NULL,
    "destinationType" "DestinationType" NOT NULL DEFAULT 'BOOKING',
    "jobType" TEXT,
    "businessUnit" TEXT,
    "priority" TEXT,
    "assignedTo" TEXT,
    "followupDays" INTEGER NOT NULL DEFAULT 0,
    "capiEnabled" BOOLEAN NOT NULL DEFAULT true,
    "campaignTag" TEXT,
    "emailTemplateId" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldMapping" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "metaField" TEXT NOT NULL,
    "stField" TEXT NOT NULL,
    "transform" TEXT,

    CONSTRAINT "FieldMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "metaLeadId" TEXT NOT NULL,
    "metaAdId" TEXT,
    "metaAdSetId" TEXT,
    "metaCampaignId" TEXT,
    "rawData" JSONB NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "zip" TEXT,
    "city" TEXT,
    "state" TEXT,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "serviceInterest" TEXT,
    "stCustomerId" TEXT,
    "stJobId" TEXT,
    "stLeadId" TEXT,
    "stTaskId" TEXT,
    "stMatchedCustomer" BOOLEAN NOT NULL DEFAULT false,
    "routingStatus" "RoutingStatus" NOT NULL DEFAULT 'PENDING',
    "routingError" TEXT,
    "routingAttempts" INTEGER NOT NULL DEFAULT 0,
    "emailStatus" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "emailSentAt" TIMESTAMP(3),
    "capiStatus" "CAPIStatus" NOT NULL DEFAULT 'PENDING',
    "capiEventId" TEXT,
    "bookingValue" DOUBLE PRECISION,
    "invoiceValue" DOUBLE PRECISION,
    "capiBookingEventId" TEXT,
    "capiInvoiceEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CAPIEvent" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventTime" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "CAPIStatus" NOT NULL DEFAULT 'PENDING',
    "metaEventId" TEXT,
    "metaAdId" TEXT,
    "metaAdSetId" TEXT,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CAPIEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orgs_email_key" ON "orgs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_metaLeadId_key" ON "Lead"("metaLeadId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "orgs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaConnection" ADD CONSTRAINT "MetaConnection_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "STConnection" ADD CONSTRAINT "STConnection_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_metaConnectionId_fkey" FOREIGN KEY ("metaConnectionId") REFERENCES "MetaConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_stConnectionId_fkey" FOREIGN KEY ("stConnectionId") REFERENCES "STConnection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_emailTemplateId_fkey" FOREIGN KEY ("emailTemplateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FieldMapping" ADD CONSTRAINT "FieldMapping_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CAPIEvent" ADD CONSTRAINT "CAPIEvent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
