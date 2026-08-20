/*
  Warnings:

  - Added the required column `passwordHash` to the `manufacturers` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_manufacturers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_manufacturers" ("companyName", "createdAt", "email", "id", "name", "updatedAt") SELECT "companyName", "createdAt", "email", "id", "name", "updatedAt" FROM "manufacturers";
DROP TABLE "manufacturers";
ALTER TABLE "new_manufacturers" RENAME TO "manufacturers";
CREATE UNIQUE INDEX "manufacturers_email_key" ON "manufacturers"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
