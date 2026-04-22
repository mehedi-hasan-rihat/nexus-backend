/*
  Warnings:

  - A unique constraint covering the columns `[registrationId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "registrationId" TEXT,
ALTER COLUMN "campusId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "campus_registrations" (
    "id" TEXT NOT NULL,
    "campusName" TEXT NOT NULL,
    "campusCode" TEXT NOT NULL,
    "address" TEXT,
    "createdById" TEXT NOT NULL,
    "principalName" TEXT NOT NULL,
    "principalEmail" TEXT NOT NULL,
    "principalPassword" TEXT NOT NULL,
    "stripeSessionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campus_registrations_stripeSessionId_key" ON "campus_registrations"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_registrationId_key" ON "payments"("registrationId");

-- AddForeignKey
ALTER TABLE "campus_registrations" ADD CONSTRAINT "campus_registrations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "campus_registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
