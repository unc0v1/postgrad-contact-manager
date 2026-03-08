-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'FIRST_CONTACT',
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "storagePath" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "fileExtension" TEXT,
    "originalFileName" TEXT,
    "isPreset" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmailTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EmailTemplate" ("category", "content", "createdAt", "id", "isPreset", "name", "subject", "updatedAt", "userId") SELECT "category", "content", "createdAt", "id", "isPreset", "name", "subject", "updatedAt", "userId" FROM "EmailTemplate";
DROP TABLE "EmailTemplate";
ALTER TABLE "new_EmailTemplate" RENAME TO "EmailTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
