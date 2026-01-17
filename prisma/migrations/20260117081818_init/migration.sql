-- CreateTable
CREATE TABLE "SoundEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "audioUrl" TEXT NOT NULL,
    "voiceMode" TEXT NOT NULL,
    "locationLevel" TEXT NOT NULL,
    "locationText" TEXT,
    "situation" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "tagsTheme" TEXT NOT NULL,
    "tagsStage" TEXT NOT NULL,
    "tagsEmotion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ownerToken" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Response" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entryId" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "text" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Response_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "SoundEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SoundEntry_situation_idx" ON "SoundEntry"("situation");

-- CreateIndex
CREATE INDEX "SoundEntry_createdAt_idx" ON "SoundEntry"("createdAt");

-- CreateIndex
CREATE INDEX "Response_entryId_idx" ON "Response"("entryId");
