/*
  Warnings:

  - You are about to drop the column `closed` on the `Application` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'CLOSED', 'APPROVED');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "closed",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'PENDING';
