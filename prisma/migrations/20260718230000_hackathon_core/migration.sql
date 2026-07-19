ALTER TABLE "Diagnosis" ADD COLUMN "customerEmail" TEXT;
CREATE TABLE "Booking" ("id" TEXT NOT NULL,"customerEmail" TEXT NOT NULL,"customerName" TEXT NOT NULL,"phone" TEXT NOT NULL,"deviceCategory" TEXT NOT NULL,"brand" TEXT NOT NULL,"deviceModel" TEXT NOT NULL,"service" TEXT NOT NULL,"location" TEXT NOT NULL,"appointmentAt" TIMESTAMP(3) NOT NULL,"status" TEXT NOT NULL DEFAULT 'Booked',"estimatedTotalCents" INTEGER NOT NULL DEFAULT 0,"notes" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "Booking_pkey" PRIMARY KEY ("id"));
CREATE INDEX "Booking_customerEmail_createdAt_idx" ON "Booking"("customerEmail","createdAt");
CREATE INDEX "Booking_status_appointmentAt_idx" ON "Booking"("status","appointmentAt");
