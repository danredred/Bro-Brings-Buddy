-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('ADMIN', 'MEMBER', 'PEASANT');

-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" BYTEA NOT NULL,
    "permission" "Permission" NOT NULL DEFAULT 'PEASANT',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_key" ON "Users"("username");
