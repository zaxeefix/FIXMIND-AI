ALTER TABLE "Booking"
ADD COLUMN "assignedTechnicianEmail" TEXT,
ADD COLUMN "technicianNotes" TEXT,
ADD COLUMN "repairPhotos" JSONB NOT NULL DEFAULT '[]';

CREATE INDEX "Booking_assignedTechnicianEmail_status_idx" ON "Booking"("assignedTechnicianEmail", "status");
