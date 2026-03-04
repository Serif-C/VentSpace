-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nickname" TEXT NOT NULL DEFAULT 'Anonymous',
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "notifyOnComments" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnReactions" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_User" ("avatarUrl", "createdAt", "email", "id", "nickname", "passwordHash", "updatedAt") SELECT "avatarUrl", "createdAt", "email", "id", "nickname", "passwordHash", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
