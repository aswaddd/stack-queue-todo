CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "structure" TEXT NOT NULL,
    "position" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "Task_structure_position_idx" ON "Task"("structure", "position");
