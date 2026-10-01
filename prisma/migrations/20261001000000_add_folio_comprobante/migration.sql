-- AlterTable
ALTER TABLE `torneos` ADD COLUMN `consecutivo_inscripciones` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `info_liga` ADD COLUMN `consecutivo_inscripciones` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `inscripciones` ADD COLUMN `numero_inscripcion` INTEGER NULL,
    ADD COLUMN `folio` VARCHAR(40) NULL;

-- AlterTable
ALTER TABLE `jugadores_liga` ADD COLUMN `numero_inscripcion` INTEGER NULL,
    ADD COLUMN `folio` VARCHAR(40) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `inscripciones_folio_key` ON `inscripciones`(`folio`);

-- CreateIndex
CREATE UNIQUE INDEX `jugadores_liga_folio_key` ON `jugadores_liga`(`folio`);
