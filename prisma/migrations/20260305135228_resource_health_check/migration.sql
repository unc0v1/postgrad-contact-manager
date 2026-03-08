-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResourceLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '未分类',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisitedAt" DATETIME,
    "healthStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "lastCheckedAt" DATETIME,
    "lastCheckStatusCode" INTEGER,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResourceLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ResourceLink" ("category", "createdAt", "description", "id", "isPinned", "lastVisitedAt", "title", "updatedAt", "url", "userId", "visitCount") SELECT "category", "createdAt", "description", "id", "isPinned", "lastVisitedAt", "title", "updatedAt", "url", "userId", "visitCount" FROM "ResourceLink";
DROP TABLE "ResourceLink";
ALTER TABLE "new_ResourceLink" RENAME TO "ResourceLink";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
