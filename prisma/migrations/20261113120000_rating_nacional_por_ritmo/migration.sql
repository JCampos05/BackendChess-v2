-- El rating nacional (FENAMAC) se lleva por ritmo de juego: estándar, rápido y blitz.
-- Sustituye a la columna única `rating_nacional` de la migración anterior (nunca se llenó con datos reales; si
-- tuviera algo, se conserva en el rating nacional estándar).

-- AlterTable
ALTER TABLE `jugadores`
    ADD COLUMN `rating_nacional_estandar` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `rating_nacional_rapido` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `rating_nacional_blitz` INTEGER NOT NULL DEFAULT 0;

-- Conservar lo que hubiera en la columna anterior
UPDATE `jugadores` SET `rating_nacional_estandar` = `rating_nacional`;

-- DropIndex
DROP INDEX `jugadores_rating_nacional_idx` ON `jugadores`;

-- AlterTable
ALTER TABLE `jugadores` DROP COLUMN `rating_nacional`;
