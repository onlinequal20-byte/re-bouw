-- AlterTable
ALTER TABLE "Factuur" ADD COLUMN "algemeneVoorwaardenHash" TEXT;
ALTER TABLE "Factuur" ADD COLUMN "algemeneVoorwaardenUrl" TEXT;
ALTER TABLE "Factuur" ADD COLUMN "klantGetekendOp" DATETIME;
ALTER TABLE "Factuur" ADD COLUMN "klantHandtekening" TEXT;
ALTER TABLE "Factuur" ADD COLUMN "klantIpAdres" TEXT;
ALTER TABLE "Factuur" ADD COLUMN "klantNaam" TEXT;

-- AlterTable
ALTER TABLE "Offerte" ADD COLUMN "algemeneVoorwaardenHash" TEXT;
ALTER TABLE "Offerte" ADD COLUMN "algemeneVoorwaardenUrl" TEXT;
ALTER TABLE "Offerte" ADD COLUMN "bedrijfGetekendOp" DATETIME;
ALTER TABLE "Offerte" ADD COLUMN "bedrijfHandtekening" TEXT;
ALTER TABLE "Offerte" ADD COLUMN "bedrijfNaam" TEXT;
ALTER TABLE "Offerte" ADD COLUMN "klantGetekendOp" DATETIME;
ALTER TABLE "Offerte" ADD COLUMN "klantHandtekening" TEXT;
ALTER TABLE "Offerte" ADD COLUMN "klantIpAdres" TEXT;
ALTER TABLE "Offerte" ADD COLUMN "klantNaam" TEXT;
