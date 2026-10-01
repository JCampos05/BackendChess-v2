-- AlterTable
ALTER TABLE `info_liga` ADD COLUMN `idSistemaPago` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `info_liga` ADD CONSTRAINT `info_liga_idSistemaPago_fkey` FOREIGN KEY (`idSistemaPago`) REFERENCES `sistema_pago`(`idSistemaPago`) ON DELETE SET NULL ON UPDATE CASCADE;
