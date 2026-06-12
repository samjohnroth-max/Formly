-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "MetaConnection" ADD COLUMN "groupId" TEXT;

-- AlterTable
ALTER TABLE "STConnection" ADD COLUMN "groupId" TEXT;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "orgs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaConnection" ADD CONSTRAINT "MetaConnection_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "STConnection" ADD CONSTRAINT "STConnection_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
