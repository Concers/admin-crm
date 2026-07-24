-- CreateTable
CREATE TABLE "GenericForm" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kind" TEXT NOT NULL,
    "subtype" TEXT,
    "title" TEXT NOT NULL,
    "partnerId" INTEGER,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "body" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GenericForm_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "GenericForm_kind_idx" ON "GenericForm"("kind");

-- CreateIndex
CREATE INDEX "GenericForm_partnerId_idx" ON "GenericForm"("partnerId");
