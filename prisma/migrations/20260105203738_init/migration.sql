-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Klant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "naam" TEXT NOT NULL,
    "email" TEXT,
    "telefoon" TEXT,
    "adres" TEXT,
    "postcode" TEXT,
    "plaats" TEXT,
    "kvkNummer" TEXT,
    "notities" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Prijslijst" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categorie" TEXT NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "prijsPerEenheid" REAL NOT NULL,
    "eenheid" TEXT NOT NULL,
    "materiaalKosten" REAL NOT NULL DEFAULT 0,
    "actief" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Offerte" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerteNummer" TEXT NOT NULL,
    "datum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "geldigTot" DATETIME NOT NULL,
    "klantId" TEXT NOT NULL,
    "projectNaam" TEXT NOT NULL,
    "projectLocatie" TEXT,
    "subtotaal" REAL NOT NULL,
    "btwPercentage" REAL NOT NULL,
    "btwBedrag" REAL NOT NULL,
    "totaal" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Concept',
    "emailVerzonden" BOOLEAN NOT NULL DEFAULT false,
    "notities" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offerte_klantId_fkey" FOREIGN KEY ("klantId") REFERENCES "Klant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OfferteItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offerteId" TEXT NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "aantal" REAL NOT NULL,
    "eenheid" TEXT NOT NULL,
    "prijsPerEenheid" REAL NOT NULL,
    "totaal" REAL NOT NULL,
    "volgorde" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OfferteItem_offerteId_fkey" FOREIGN KEY ("offerteId") REFERENCES "Offerte" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Factuur" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factuurNummer" TEXT NOT NULL,
    "datum" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vervaldatum" DATETIME NOT NULL,
    "klantId" TEXT NOT NULL,
    "projectNaam" TEXT NOT NULL,
    "projectLocatie" TEXT,
    "subtotaal" REAL NOT NULL,
    "btwPercentage" REAL NOT NULL,
    "btwBedrag" REAL NOT NULL,
    "totaal" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Onbetaald',
    "betaaldBedrag" REAL NOT NULL DEFAULT 0,
    "emailVerzonden" BOOLEAN NOT NULL DEFAULT false,
    "notities" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Factuur_klantId_fkey" FOREIGN KEY ("klantId") REFERENCES "Klant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FactuurItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "factuurId" TEXT NOT NULL,
    "omschrijving" TEXT NOT NULL,
    "aantal" REAL NOT NULL,
    "eenheid" TEXT NOT NULL,
    "prijsPerEenheid" REAL NOT NULL,
    "totaal" REAL NOT NULL,
    "volgorde" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FactuurItem_factuurId_fkey" FOREIGN KEY ("factuurId") REFERENCES "Factuur" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Offerte_offerteNummer_key" ON "Offerte"("offerteNummer");

-- CreateIndex
CREATE UNIQUE INDEX "Factuur_factuurNummer_key" ON "Factuur"("factuurNummer");

-- CreateIndex
CREATE UNIQUE INDEX "Settings_key_key" ON "Settings"("key");
