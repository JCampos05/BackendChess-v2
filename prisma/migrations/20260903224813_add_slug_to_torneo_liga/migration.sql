-- AlterTable
ALTER TABLE `torneos` ADD COLUMN `slug` VARCHAR(220) NULL;

-- AlterTable
ALTER TABLE `info_liga` ADD COLUMN `slug` VARCHAR(220) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `torneos_slug_key` ON `torneos`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `info_liga_slug_key` ON `info_liga`(`slug`);
