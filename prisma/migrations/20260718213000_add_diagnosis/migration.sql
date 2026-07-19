CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL,
    "deviceCategory" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "deviceModel" TEXT NOT NULL,
    "deviceAge" TEXT NOT NULL,
    "problemCategory" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "imageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Diagnosis_createdAt_idx" ON "Diagnosis"("createdAt");
CREATE INDEX "Diagnosis_brand_deviceModel_idx" ON "Diagnosis"("brand", "deviceModel");
