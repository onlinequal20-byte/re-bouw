-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "documentNummer" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'verzonden',
    "errorMessage" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" DATETIME,
    "clickedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Email_type_idx" ON "Email"("type");

-- CreateIndex
CREATE INDEX "Email_documentId_idx" ON "Email"("documentId");

-- CreateIndex
CREATE INDEX "Email_sentAt_idx" ON "Email"("sentAt");
