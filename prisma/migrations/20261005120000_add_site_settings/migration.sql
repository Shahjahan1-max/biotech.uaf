-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL,
    "founderName" TEXT NOT NULL DEFAULT 'Shah Jahan',
    "founderImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

-- SeedData
INSERT INTO "SiteSetting" ("id", "updatedAt") VALUES ('site', CURRENT_TIMESTAMP);
