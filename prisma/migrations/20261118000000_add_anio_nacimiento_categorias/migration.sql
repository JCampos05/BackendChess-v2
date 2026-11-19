-- Regla por año de nacimiento en categorías (convocatorias: "nacidos de 2011 a 2014")
ALTER TABLE `categorias` ADD COLUMN `anioNacimientoDesde` INTEGER NULL, ADD COLUMN `anioNacimientoHasta` INTEGER NULL;
