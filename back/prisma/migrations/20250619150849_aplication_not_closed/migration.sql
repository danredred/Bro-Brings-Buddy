-- CreateEnum
CREATE TYPE "ApplicationType" AS ENUM ('TOMEMBER', 'TOADMIN');

-- DropIndex
DROP INDEX "Application_aboutUserId_key";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "closed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "ApplicationType" NOT NULL DEFAULT 'TOMEMBER';
