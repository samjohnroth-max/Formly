-- Indexes for MetaConnection
CREATE INDEX "MetaConnection_accountId_idx" ON "MetaConnection"("accountId");
CREATE INDEX "MetaConnection_accountId_status_idx" ON "MetaConnection"("accountId", "status");

-- Indexes for STConnection
CREATE INDEX "STConnection_accountId_idx" ON "STConnection"("accountId");
CREATE INDEX "STConnection_accountId_status_idx" ON "STConnection"("accountId", "status");

-- Indexes for Campaign (metaFormId is queried on every incoming lead)
CREATE INDEX "Campaign_accountId_idx" ON "Campaign"("accountId");
CREATE INDEX "Campaign_metaFormId_status_idx" ON "Campaign"("metaFormId", "status");

-- Indexes for Lead (most frequently queried table)
CREATE INDEX "Lead_accountId_createdAt_idx" ON "Lead"("accountId", "createdAt" DESC);
CREATE INDEX "Lead_accountId_routingStatus_idx" ON "Lead"("accountId", "routingStatus");
CREATE INDEX "Lead_campaignId_idx" ON "Lead"("campaignId");
CREATE INDEX "Lead_stJobId_idx" ON "Lead"("stJobId");

-- Index for CAPIEvent
CREATE INDEX "CAPIEvent_leadId_idx" ON "CAPIEvent"("leadId");
