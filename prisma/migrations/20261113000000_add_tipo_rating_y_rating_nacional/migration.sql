-- Rating nacional del jugador y tipo de rating por torneo.
-- Solo AGREGA columnas con valor por defecto: no modifica ni borra datos existentes.
-- El rating actual de todos los jugadores (columna `rating`) pasa a ser el ESTATAL sin moverlo;
-- los torneos existentes quedan como 'estatal' (su comportamiento de siempre).

-- AlterTable
ALTER TABLE `jugadores` ADD COLUMN `rating_nacional` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `torneos` ADD COLUMN `tipo_rating` ENUM('sin_rating', 'estatal', 'nacional') NOT NULL DEFAULT 'estatal';

-- CreateIndex
CREATE INDEX `jugadores_rating_nacional_idx` ON `jugadores`(`rating_nacional`);
