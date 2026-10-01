-- AlterTable
ALTER TABLE `torneos` DROP COLUMN `hora`,
ADD COLUMN `hora_inicio` VARCHAR(8) NULL,
ADD COLUMN `hora_fin` VARCHAR(8) NULL;
