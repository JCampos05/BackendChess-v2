-- CreateTable
CREATE TABLE `zonas_horaria` (
    `idZonaHoraria` TINYINT UNSIGNED NOT NULL,
    `nombreZona` VARCHAR(50) NOT NULL,
    `offsetUTC` DECIMAL(3, 1) NOT NULL,
    `nombreMostrar` VARCHAR(100) NOT NULL,
    `fechaCreado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaActualizado` DATETIME(3) NOT NULL,

    UNIQUE INDEX `zonas_horaria_nombreZona_key`(`nombreZona`),
    INDEX `zonas_horaria_nombreZona_idx`(`nombreZona`),
    PRIMARY KEY (`idZonaHoraria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `config_gral` (
    `idConfig` INTEGER NOT NULL AUTO_INCREMENT,
    `idZonaHoraria` TINYINT UNSIGNED NOT NULL,
    `facebook` VARCHAR(255) NULL,
    `instagram` VARCHAR(255) NULL,
    `twitter` VARCHAR(255) NULL,
    `youtube` VARCHAR(255) NULL,
    `whatsapp` VARCHAR(20) NULL,
    `nombreComite` VARCHAR(255) NOT NULL DEFAULT 'Comité Municipal de Ajedrez Ahome',
    `descripcion` TEXT NULL,
    `telefono` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `ciudad` VARCHAR(100) NULL,
    `estado` VARCHAR(100) NULL,
    `pais` VARCHAR(100) NOT NULL DEFAULT 'México',
    `diasAutoDesactivar` INTEGER NOT NULL DEFAULT 3,
    `extras` JSON NULL,
    `fechaCreado` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaActualizado` DATETIME(3) NOT NULL,

    PRIMARY KEY (`idConfig`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario` (
    `idUsuario` INTEGER NOT NULL AUTO_INCREMENT,
    `telefono` VARCHAR(15) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `rol` ENUM('adminGral', 'adminTorneo') NOT NULL DEFAULT 'adminTorneo',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_actualizacion` DATETIME(3) NULL,
    `fecha_registro` DATETIME(3) NULL,
    `ultimo_acceso` DATETIME(3) NULL,

    UNIQUE INDEX `usuario_telefono_key`(`telefono`),
    INDEX `usuario_rol_idx`(`rol`),
    INDEX `usuario_activo_idx`(`activo`),
    PRIMARY KEY (`idUsuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuario_torneo` (
    `idUsuarioTorneo` INTEGER NOT NULL AUTO_INCREMENT,
    `idUsuario` INTEGER NOT NULL,
    `idTorneo` INTEGER NOT NULL,
    `fechaAsignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `notas` VARCHAR(255) NULL,

    INDEX `usuario_torneo_idUsuario_idx`(`idUsuario`),
    INDEX `usuario_torneo_idTorneo_idx`(`idTorneo`),
    INDEX `usuario_torneo_activo_idx`(`activo`),
    UNIQUE INDEX `usuario_torneo_idUsuario_idTorneo_key`(`idUsuario`, `idTorneo`),
    PRIMARY KEY (`idUsuarioTorneo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesiones_activas` (
    `idSesion` INTEGER NOT NULL AUTO_INCREMENT,
    `idUsuario` INTEGER NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `ip` VARCHAR(45) NULL,
    `navegador` VARCHAR(255) NULL,
    `dispositivo` VARCHAR(255) NULL,
    `ultimo_acceso` DATETIME(3) NOT NULL,
    `fecha_expiracion` DATETIME(3) NULL,
    `activa` TINYINT NOT NULL DEFAULT 1,

    INDEX `sesiones_activas_token_idx`(`token`(100)),
    INDEX `sesiones_activas_activa_idx`(`activa`),
    PRIMARY KEY (`idSesion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_accesos` (
    `idAcceso` INTEGER NOT NULL AUTO_INCREMENT,
    `idUsuario` INTEGER NULL,
    `tipo` ENUM('login_exitoso', 'login_fallido', 'logout', 'otro') NOT NULL DEFAULT 'login_exitoso',
    `ip` VARCHAR(45) NULL,
    `navegador` VARCHAR(255) NULL,
    `dispositivo` VARCHAR(255) NULL,
    `ubicacion` VARCHAR(100) NULL,
    `fecha` DATETIME(3) NOT NULL,

    INDEX `historial_accesos_idUsuario_idx`(`idUsuario`),
    INDEX `historial_accesos_fecha_idx`(`fecha`),
    PRIMARY KEY (`idAcceso`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logs_sistema` (
    `idLog` INTEGER NOT NULL AUTO_INCREMENT,
    `idUsuario` INTEGER NULL,
    `accion` VARCHAR(100) NOT NULL,
    `entidad` VARCHAR(50) NOT NULL,
    `idEntidad` INTEGER NULL,
    `detalles` TEXT NULL,
    `nivel` ENUM('info', 'warning', 'error', 'otro') NOT NULL DEFAULT 'info',
    `ip` VARCHAR(45) NULL,
    `fecha` DATETIME(3) NOT NULL,

    INDEX `logs_sistema_nivel_idx`(`nivel`),
    INDEX `logs_sistema_entidad_idx`(`entidad`),
    INDEX `logs_sistema_fecha_idx`(`fecha`),
    PRIMARY KEY (`idLog`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `idCategoria` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `costo` DECIMAL(10, 2) NOT NULL,
    `nota` TEXT NULL,
    `edadMinima` INTEGER NULL,
    `edadMaxima` INTEGER NULL,
    `tipo_validacion_edad` ENUM('anio_torneo', 'fecha_exacta') NOT NULL DEFAULT 'anio_torneo',

    UNIQUE INDEX `categorias_nombre_key`(`nombre`),
    PRIMARY KEY (`idCategoria`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ritmos_juego` (
    `idRitmoJuego` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(50) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `minutos` INTEGER NOT NULL,
    `incremento` INTEGER NOT NULL DEFAULT 0,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` DATETIME(3) NULL,

    UNIQUE INDEX `ritmos_juego_nombre_key`(`nombre`),
    INDEX `ritmos_juego_activo_idx`(`activo`),
    PRIMARY KEY (`idRitmoJuego`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sistemas_competencia` (
    `idSisCompetencia` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` DATETIME(3) NULL,

    UNIQUE INDEX `sistemas_competencia_nombre_key`(`nombre`),
    INDEX `sistemas_competencia_activo_idx`(`activo`),
    PRIMARY KEY (`idSisCompetencia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sistemas_desempate` (
    `idDesempate` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` DATETIME(3) NULL,

    UNIQUE INDEX `sistemas_desempate_nombre_key`(`nombre`),
    INDEX `sistemas_desempate_activo_idx`(`activo`),
    PRIMARY KEY (`idDesempate`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sistema_pago` (
    `idSistemaPago` INTEGER NOT NULL AUTO_INCREMENT,
    `nombreCuenta` VARCHAR(100) NOT NULL,
    `banco` VARCHAR(75) NOT NULL,
    `numeroCuenta` VARCHAR(20) NOT NULL,
    `clabe` VARCHAR(18) NOT NULL,
    `telefono` VARCHAR(15) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_registro` DATETIME(3) NULL,
    `actualizacion` DATETIME(3) NULL,

    INDEX `sistema_pago_activo_idx`(`activo`),
    PRIMARY KEY (`idSistemaPago`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patrocinadores` (
    `idPatrocinador` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `logo_url` VARCHAR(500) NULL,
    `sitio_web` VARCHAR(255) NULL,
    `descripcion` TEXT NULL,
    `contacto` VARCHAR(100) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_registro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizacion` DATETIME(3) NOT NULL,

    INDEX `patrocinadores_activo_idx`(`activo`),
    PRIMARY KEY (`idPatrocinador`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `torneo_patrocinador` (
    `idTorneoPatrocinador` INTEGER NOT NULL AUTO_INCREMENT,
    `idTorneo` INTEGER NOT NULL,
    `idPatrocinador` INTEGER NOT NULL,
    `nivel` ENUM('principal', 'oro', 'plata', 'bronce', 'general') NOT NULL DEFAULT 'general',
    `orden` INTEGER NOT NULL DEFAULT 0,
    `fecha_asignacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `torneo_patrocinador_idTorneo_idx`(`idTorneo`),
    INDEX `torneo_patrocinador_idPatrocinador_idx`(`idPatrocinador`),
    UNIQUE INDEX `torneo_patrocinador_idTorneo_idPatrocinador_key`(`idTorneo`, `idPatrocinador`),
    PRIMARY KEY (`idTorneoPatrocinador`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jugadores` (
    `idJugador` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido1` VARCHAR(100) NOT NULL,
    `apellido2` VARCHAR(100) NULL,
    `telefono` VARCHAR(15) NULL,
    `fecha_nacimiento` DATE NULL,
    `idCategoria` INTEGER NULL,
    `notas` TEXT NULL,
    `estado` ENUM('pendiente_pago', 'activo', 'inactivo') NOT NULL DEFAULT 'pendiente_pago',
    `pago_confirmado` BOOLEAN NOT NULL DEFAULT false,
    `fecha_registro` DATETIME(3) NULL,
    `actualizacion` DATETIME(3) NULL,
    `rating` INTEGER NOT NULL DEFAULT 0,

    INDEX `jugadores_apellido1_nombre_idx`(`apellido1`, `nombre`),
    INDEX `jugadores_idCategoria_idx`(`idCategoria`),
    INDEX `jugadores_rating_idx`(`rating`),
    INDEX `jugadores_estado_idx`(`estado`),
    UNIQUE INDEX `jugadores_nombre_apellido1_apellido2_fecha_nacimiento_key`(`nombre`, `apellido1`, `apellido2`, `fecha_nacimiento`),
    PRIMARY KEY (`idJugador`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `torneos` (
    `idTorneo` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NULL,
    `lugar` VARCHAR(255) NOT NULL,
    `direccion` VARCHAR(255) NOT NULL,
    `url_maps` VARCHAR(500) NULL,
    `fecha` DATE NOT NULL,
    `hora` TIME NOT NULL,
    `estado` ENUM('borrador', 'publicado', 'en_curso', 'finalizado', 'cancelado') NOT NULL DEFAULT 'borrador',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `es_actual` BOOLEAN NOT NULL DEFAULT true,
    `notas` TEXT NULL,
    `rondas` INTEGER NOT NULL DEFAULT 5,
    `cupo_maximo` INTEGER NULL,
    `cierre_inscripciones` DATETIME(3) NULL,
    `idZonaHoraria` TINYINT UNSIGNED NULL,
    `idSistemaPago` INTEGER NULL,
    `fecha_creacion` DATETIME(3) NULL,
    `fecha_actualizacion` DATETIME(3) NULL,

    INDEX `torneos_fecha_idx`(`fecha`),
    INDEX `torneos_activo_idx`(`activo`),
    INDEX `torneos_es_actual_idx`(`es_actual`),
    INDEX `torneos_estado_idx`(`estado`),
    INDEX `torneos_idZonaHoraria_idx`(`idZonaHoraria`),
    PRIMARY KEY (`idTorneo`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `torneo_categorias` (
    `idTorneoCat` INTEGER NOT NULL AUTO_INCREMENT,
    `idTorneo` INTEGER NOT NULL,
    `idCategoria` INTEGER NOT NULL,
    `rondas` INTEGER NOT NULL DEFAULT 5,
    `ritmo_juego` VARCHAR(50) NULL,
    `sistema_competencia` VARCHAR(100) NULL,
    `calendario` JSON NULL,
    `premios` JSON NULL,
    `desempates` JSON NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `cierre_inscripciones` DATETIME(3) NULL,
    `cupo_maximo` INTEGER NULL,

    INDEX `torneo_categorias_idTorneo_idx`(`idTorneo`),
    INDEX `torneo_categorias_idCategoria_idx`(`idCategoria`),
    INDEX `torneo_categorias_activo_idx`(`activo`),
    UNIQUE INDEX `torneo_categorias_idTorneo_idCategoria_key`(`idTorneo`, `idCategoria`),
    PRIMARY KEY (`idTorneoCat`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscripciones` (
    `idInscripcion` INTEGER NOT NULL AUTO_INCREMENT,
    `idJugador` INTEGER NOT NULL,
    `idTorneo` INTEGER NOT NULL,
    `idCategoria` INTEGER NULL,
    `estado` ENUM('pendiente_pago', 'confirmado', 'cancelado') NOT NULL DEFAULT 'pendiente_pago',
    `pago_confirmado` BOOLEAN NOT NULL DEFAULT false,
    `monto_pagado` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `notas` TEXT NULL,
    `idAdminConfirmo` INTEGER NULL,
    `fecha_confirmacion` DATETIME(3) NULL,
    `fecha_inscripcion` DATETIME(3) NULL,
    `fecha_actualizacion` DATETIME(3) NULL,

    INDEX `inscripciones_idJugador_idx`(`idJugador`),
    INDEX `inscripciones_idTorneo_idx`(`idTorneo`),
    INDEX `inscripciones_estado_idx`(`estado`),
    INDEX `inscripciones_pago_confirmado_idx`(`pago_confirmado`),
    UNIQUE INDEX `inscripciones_idJugador_idTorneo_key`(`idJugador`, `idTorneo`),
    PRIMARY KEY (`idInscripcion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rondas` (
    `idRonda` INTEGER NOT NULL AUTO_INCREMENT,
    `idTorneo` INTEGER NOT NULL,
    `idTorneoCategoria` INTEGER NOT NULL,
    `numeroRonda` INTEGER NOT NULL,
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_fin` DATETIME(3) NULL,
    `estado` ENUM('pendiente', 'en_curso', 'finalizada') NOT NULL DEFAULT 'pendiente',
    `notas` TEXT NULL,
    `fecha_creacion` DATETIME(3) NULL,

    INDEX `rondas_idTorneo_idx`(`idTorneo`),
    INDEX `rondas_idTorneoCategoria_idx`(`idTorneoCategoria`),
    INDEX `rondas_estado_idx`(`estado`),
    PRIMARY KEY (`idRonda`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mesas` (
    `idMesa` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroMesa` INTEGER NOT NULL,
    `idRonda` INTEGER NOT NULL,
    `idJugadorBlanco` INTEGER NOT NULL,
    `idJugadorNegro` INTEGER NOT NULL,
    `ilegalesBlanco` INTEGER NOT NULL DEFAULT 0,
    `ilegalesNegro` INTEGER NOT NULL DEFAULT 0,
    `estado` ENUM('pendiente', 'en_curso', 'finalizada') NOT NULL DEFAULT 'pendiente',
    `notas` TEXT NULL,
    `fecha_creacion` DATETIME(3) NULL,
    `usuarioEditando` VARCHAR(20) NULL,
    `timestampEdicion` DATETIME(3) NULL,

    INDEX `mesas_idRonda_idx`(`idRonda`),
    INDEX `mesas_estado_idx`(`estado`),
    PRIMARY KEY (`idMesa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partidas` (
    `idPartida` INTEGER NOT NULL AUTO_INCREMENT,
    `idMesa` INTEGER NOT NULL,
    `idJugadorGanador` INTEGER NULL,
    `resultado` VARCHAR(10) NOT NULL,
    `tipo_finalizacion` ENUM('jaquemate', 'tiempo', 'rendicion', 'ilegales', 'incomparecencia', 'empate_comun', 'empate_material', 'empate_50_movidas', 'empate_triple_repeticion', 'otro') NULL,
    `descripcion_finalizacion` TEXT NULL,
    `duracion_minutos` INTEGER NULL,
    `fecha_finalizacion` DATETIME(3) NULL,

    UNIQUE INDEX `partidas_idMesa_key`(`idMesa`),
    PRIMARY KEY (`idPartida`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `estadisticas_torneo` (
    `idEstadistica` INTEGER NOT NULL AUTO_INCREMENT,
    `idJugador` INTEGER NOT NULL,
    `idTorneo` INTEGER NOT NULL,
    `idTorneoCategoria` INTEGER NOT NULL,
    `rating_torneo` INTEGER NULL,
    `puntos` DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
    `desempates` JSON NULL,
    `partidas_jugadas` INTEGER NOT NULL DEFAULT 0,
    `victorias` INTEGER NOT NULL DEFAULT 0,
    `empates` INTEGER NOT NULL DEFAULT 0,
    `derrotas` INTEGER NOT NULL DEFAULT 0,
    `posicion_actual` INTEGER NULL,
    `fecha_actualizacion` DATETIME(3) NULL,

    INDEX `estadisticas_torneo_idJugador_idx`(`idJugador`),
    INDEX `estadisticas_torneo_idTorneo_idx`(`idTorneo`),
    INDEX `estadisticas_torneo_puntos_idx`(`puntos`),
    INDEX `estadisticas_torneo_posicion_actual_idx`(`posicion_actual`),
    PRIMARY KEY (`idEstadistica`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_emparejamientos` (
    `idHistorial` INTEGER NOT NULL AUTO_INCREMENT,
    `idJugador1` INTEGER NOT NULL,
    `idJugador2` INTEGER NOT NULL,
    `idTorneo` INTEGER NOT NULL,
    `idTorneoCategoria` INTEGER NOT NULL,
    `numeroRonda` INTEGER NOT NULL,
    `fecha_emparejamiento` DATETIME(3) NULL,

    INDEX `historial_emparejamientos_idJugador1_idJugador2_idTorneo_idx`(`idJugador1`, `idJugador2`, `idTorneo`),
    PRIMARY KEY (`idHistorial`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `info_liga` (
    `idLiga` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha_inicio` DATE NOT NULL,
    `fecha_fin` DATE NULL,
    `lugar` VARCHAR(255) NULL,
    `direccion` VARCHAR(255) NULL,
    `url_maps` VARCHAR(500) NULL,
    `tipo_sistema` ENUM('round_robin', 'suizo', 'grupos') NOT NULL DEFAULT 'grupos',
    `num_grupos` INTEGER NOT NULL DEFAULT 1,
    `clasifican_por_grupo` INTEGER NOT NULL DEFAULT 2,
    `idRitmoJuego` INTEGER NULL,
    `costo_inscripcion` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `cierre_inscripciones` DATETIME(3) NULL,
    `max_jugadores` INTEGER NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `notas` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NULL,

    INDEX `info_liga_activo_idx`(`activo`),
    INDEX `info_liga_fecha_inicio_idx`(`fecha_inicio`),
    PRIMARY KEY (`idLiga`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grupos_liga` (
    `idGrupoLiga` INTEGER NOT NULL AUTO_INCREMENT,
    `idLiga` INTEGER NOT NULL,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` TEXT NULL,
    `max_jugadores` INTEGER NULL,
    `rondas` INTEGER NOT NULL DEFAULT 5,
    `premios` JSON NULL,
    `desempates` JSON NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NULL,

    INDEX `grupos_liga_idLiga_idx`(`idLiga`),
    UNIQUE INDEX `grupos_liga_idLiga_nombre_key`(`idLiga`, `nombre`),
    PRIMARY KEY (`idGrupoLiga`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jugadores_liga` (
    `idJugadorLiga` INTEGER NOT NULL AUTO_INCREMENT,
    `idLiga` INTEGER NOT NULL,
    `idGrupoLiga` INTEGER NOT NULL,
    `idJugador` INTEGER NOT NULL,
    `rating_inicial` INTEGER NOT NULL DEFAULT 0,
    `numero_jugador` INTEGER NULL,
    `posicion` INTEGER NULL,
    `fecha_inscripcion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `pago_confirmado` BOOLEAN NOT NULL DEFAULT false,
    `monto_pagado` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `estado` ENUM('inscrito', 'confirmado', 'retirado', 'cancelado') NOT NULL DEFAULT 'inscrito',
    `puntos` DECIMAL(3, 1) NOT NULL DEFAULT 0.0,
    `partidas_jugadas` INTEGER NOT NULL DEFAULT 0,
    `victorias` INTEGER NOT NULL DEFAULT 0,
    `empates` INTEGER NOT NULL DEFAULT 0,
    `derrotas` INTEGER NOT NULL DEFAULT 0,
    `desempates` JSON NULL,
    `posicion_grupo` INTEGER NULL,
    `notas` TEXT NULL,
    `fecha_actualizacion` DATETIME(3) NULL,

    INDEX `jugadores_liga_idLiga_idx`(`idLiga`),
    INDEX `jugadores_liga_idGrupoLiga_idx`(`idGrupoLiga`),
    INDEX `jugadores_liga_idJugador_idx`(`idJugador`),
    INDEX `jugadores_liga_puntos_idx`(`puntos`),
    UNIQUE INDEX `jugadores_liga_idLiga_idJugador_key`(`idLiga`, `idJugador`),
    PRIMARY KEY (`idJugadorLiga`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rondas_liga` (
    `idRondaLiga` INTEGER NOT NULL AUTO_INCREMENT,
    `idLiga` INTEGER NOT NULL,
    `idGrupoLiga` INTEGER NOT NULL,
    `numeroRonda` INTEGER NOT NULL,
    `fecha_programada` DATE NULL,
    `hora_inicio` TIME NULL,
    `fecha_inicio` DATETIME(3) NULL,
    `fecha_fin` DATETIME(3) NULL,
    `estado` ENUM('planificada', 'en_curso', 'finalizada', 'cancelada') NOT NULL DEFAULT 'planificada',
    `notas` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_actualizacion` DATETIME(3) NULL,

    INDEX `rondas_liga_idLiga_idx`(`idLiga`),
    INDEX `rondas_liga_idGrupoLiga_idx`(`idGrupoLiga`),
    INDEX `rondas_liga_estado_idx`(`estado`),
    UNIQUE INDEX `rondas_liga_idLiga_idGrupoLiga_numeroRonda_key`(`idLiga`, `idGrupoLiga`, `numeroRonda`),
    PRIMARY KEY (`idRondaLiga`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mesas_liga` (
    `idMesaLiga` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroMesa` INTEGER NOT NULL,
    `idRondaLiga` INTEGER NOT NULL,
    `idJugadorBlanco` INTEGER NOT NULL,
    `idJugadorNegro` INTEGER NOT NULL,
    `ilegalesBlanco` INTEGER NOT NULL DEFAULT 0,
    `ilegalesNegro` INTEGER NOT NULL DEFAULT 0,
    `estado` ENUM('pendiente', 'en_curso', 'finalizada') NOT NULL DEFAULT 'pendiente',
    `usuarioEditando` VARCHAR(20) NULL,
    `timestampEdicion` DATETIME(3) NULL,
    `notas` TEXT NULL,
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mesas_liga_idRondaLiga_idx`(`idRondaLiga`),
    INDEX `mesas_liga_estado_idx`(`estado`),
    PRIMARY KEY (`idMesaLiga`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partidas_liga` (
    `idPartidaLiga` INTEGER NOT NULL AUTO_INCREMENT,
    `idMesaLiga` INTEGER NOT NULL,
    `idJugadorGanador` INTEGER NULL,
    `resultado` VARCHAR(10) NOT NULL,
    `tipo_finalizacion` ENUM('jaquemate', 'tiempo', 'rendicion', 'ilegales', 'incomparecencia', 'empate_comun', 'empate_material', 'empate_50_movidas', 'empate_triple_repeticion', 'otro') NULL,
    `descripcion_finalizacion` TEXT NULL,
    `duracion_minutos` INTEGER NULL,
    `fecha_finalizacion` DATETIME(3) NULL,

    UNIQUE INDEX `partidas_liga_idMesaLiga_key`(`idMesaLiga`),
    PRIMARY KEY (`idPartidaLiga`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historial_emparejamientos_liga` (
    `idHistorialLiga` INTEGER NOT NULL AUTO_INCREMENT,
    `idJugador1` INTEGER NOT NULL,
    `idJugador2` INTEGER NOT NULL,
    `idLiga` INTEGER NOT NULL,
    `idGrupoLiga` INTEGER NOT NULL,
    `numeroRonda` INTEGER NOT NULL,
    `fecha_emparejamiento` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `historial_emparejamientos_liga_idJugador1_idJugador2_idLiga_idx`(`idJugador1`, `idJugador2`, `idLiga`),
    PRIMARY KEY (`idHistorialLiga`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `config_gral` ADD CONSTRAINT `config_gral_idZonaHoraria_fkey` FOREIGN KEY (`idZonaHoraria`) REFERENCES `zonas_horaria`(`idZonaHoraria`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_torneo` ADD CONSTRAINT `usuario_torneo_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuario_torneo` ADD CONSTRAINT `usuario_torneo_idTorneo_fkey` FOREIGN KEY (`idTorneo`) REFERENCES `torneos`(`idTorneo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesiones_activas` ADD CONSTRAINT `sesiones_activas_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_accesos` ADD CONSTRAINT `historial_accesos_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs_sistema` ADD CONSTRAINT `logs_sistema_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `torneo_patrocinador` ADD CONSTRAINT `torneo_patrocinador_idTorneo_fkey` FOREIGN KEY (`idTorneo`) REFERENCES `torneos`(`idTorneo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `torneo_patrocinador` ADD CONSTRAINT `torneo_patrocinador_idPatrocinador_fkey` FOREIGN KEY (`idPatrocinador`) REFERENCES `patrocinadores`(`idPatrocinador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jugadores` ADD CONSTRAINT `jugadores_idCategoria_fkey` FOREIGN KEY (`idCategoria`) REFERENCES `categorias`(`idCategoria`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `torneos` ADD CONSTRAINT `torneos_idZonaHoraria_fkey` FOREIGN KEY (`idZonaHoraria`) REFERENCES `zonas_horaria`(`idZonaHoraria`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `torneos` ADD CONSTRAINT `torneos_idSistemaPago_fkey` FOREIGN KEY (`idSistemaPago`) REFERENCES `sistema_pago`(`idSistemaPago`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `torneo_categorias` ADD CONSTRAINT `torneo_categorias_idTorneo_fkey` FOREIGN KEY (`idTorneo`) REFERENCES `torneos`(`idTorneo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `torneo_categorias` ADD CONSTRAINT `torneo_categorias_idCategoria_fkey` FOREIGN KEY (`idCategoria`) REFERENCES `categorias`(`idCategoria`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_idJugador_fkey` FOREIGN KEY (`idJugador`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_idTorneo_fkey` FOREIGN KEY (`idTorneo`) REFERENCES `torneos`(`idTorneo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_idCategoria_fkey` FOREIGN KEY (`idCategoria`) REFERENCES `categorias`(`idCategoria`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rondas` ADD CONSTRAINT `rondas_idTorneo_fkey` FOREIGN KEY (`idTorneo`) REFERENCES `torneos`(`idTorneo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rondas` ADD CONSTRAINT `rondas_idTorneoCategoria_fkey` FOREIGN KEY (`idTorneoCategoria`) REFERENCES `torneo_categorias`(`idTorneoCat`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesas` ADD CONSTRAINT `mesas_idRonda_fkey` FOREIGN KEY (`idRonda`) REFERENCES `rondas`(`idRonda`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesas` ADD CONSTRAINT `mesas_idJugadorBlanco_fkey` FOREIGN KEY (`idJugadorBlanco`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesas` ADD CONSTRAINT `mesas_idJugadorNegro_fkey` FOREIGN KEY (`idJugadorNegro`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partidas` ADD CONSTRAINT `partidas_idMesa_fkey` FOREIGN KEY (`idMesa`) REFERENCES `mesas`(`idMesa`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partidas` ADD CONSTRAINT `partidas_idJugadorGanador_fkey` FOREIGN KEY (`idJugadorGanador`) REFERENCES `jugadores`(`idJugador`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estadisticas_torneo` ADD CONSTRAINT `estadisticas_torneo_idJugador_fkey` FOREIGN KEY (`idJugador`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estadisticas_torneo` ADD CONSTRAINT `estadisticas_torneo_idTorneo_fkey` FOREIGN KEY (`idTorneo`) REFERENCES `torneos`(`idTorneo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `estadisticas_torneo` ADD CONSTRAINT `estadisticas_torneo_idTorneoCategoria_fkey` FOREIGN KEY (`idTorneoCategoria`) REFERENCES `torneo_categorias`(`idTorneoCat`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_emparejamientos` ADD CONSTRAINT `historial_emparejamientos_idJugador1_fkey` FOREIGN KEY (`idJugador1`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_emparejamientos` ADD CONSTRAINT `historial_emparejamientos_idJugador2_fkey` FOREIGN KEY (`idJugador2`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_emparejamientos` ADD CONSTRAINT `historial_emparejamientos_idTorneo_fkey` FOREIGN KEY (`idTorneo`) REFERENCES `torneos`(`idTorneo`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_emparejamientos` ADD CONSTRAINT `historial_emparejamientos_idTorneoCategoria_fkey` FOREIGN KEY (`idTorneoCategoria`) REFERENCES `torneo_categorias`(`idTorneoCat`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `info_liga` ADD CONSTRAINT `info_liga_idRitmoJuego_fkey` FOREIGN KEY (`idRitmoJuego`) REFERENCES `ritmos_juego`(`idRitmoJuego`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grupos_liga` ADD CONSTRAINT `grupos_liga_idLiga_fkey` FOREIGN KEY (`idLiga`) REFERENCES `info_liga`(`idLiga`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jugadores_liga` ADD CONSTRAINT `jugadores_liga_idLiga_fkey` FOREIGN KEY (`idLiga`) REFERENCES `info_liga`(`idLiga`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jugadores_liga` ADD CONSTRAINT `jugadores_liga_idGrupoLiga_fkey` FOREIGN KEY (`idGrupoLiga`) REFERENCES `grupos_liga`(`idGrupoLiga`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jugadores_liga` ADD CONSTRAINT `jugadores_liga_idJugador_fkey` FOREIGN KEY (`idJugador`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rondas_liga` ADD CONSTRAINT `rondas_liga_idLiga_fkey` FOREIGN KEY (`idLiga`) REFERENCES `info_liga`(`idLiga`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rondas_liga` ADD CONSTRAINT `rondas_liga_idGrupoLiga_fkey` FOREIGN KEY (`idGrupoLiga`) REFERENCES `grupos_liga`(`idGrupoLiga`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesas_liga` ADD CONSTRAINT `mesas_liga_idRondaLiga_fkey` FOREIGN KEY (`idRondaLiga`) REFERENCES `rondas_liga`(`idRondaLiga`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesas_liga` ADD CONSTRAINT `mesas_liga_idJugadorBlanco_fkey` FOREIGN KEY (`idJugadorBlanco`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mesas_liga` ADD CONSTRAINT `mesas_liga_idJugadorNegro_fkey` FOREIGN KEY (`idJugadorNegro`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partidas_liga` ADD CONSTRAINT `partidas_liga_idMesaLiga_fkey` FOREIGN KEY (`idMesaLiga`) REFERENCES `mesas_liga`(`idMesaLiga`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partidas_liga` ADD CONSTRAINT `partidas_liga_idJugadorGanador_fkey` FOREIGN KEY (`idJugadorGanador`) REFERENCES `jugadores`(`idJugador`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_emparejamientos_liga` ADD CONSTRAINT `historial_emparejamientos_liga_idJugador1_fkey` FOREIGN KEY (`idJugador1`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_emparejamientos_liga` ADD CONSTRAINT `historial_emparejamientos_liga_idJugador2_fkey` FOREIGN KEY (`idJugador2`) REFERENCES `jugadores`(`idJugador`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_emparejamientos_liga` ADD CONSTRAINT `historial_emparejamientos_liga_idLiga_fkey` FOREIGN KEY (`idLiga`) REFERENCES `info_liga`(`idLiga`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historial_emparejamientos_liga` ADD CONSTRAINT `historial_emparejamientos_liga_idGrupoLiga_fkey` FOREIGN KEY (`idGrupoLiga`) REFERENCES `grupos_liga`(`idGrupoLiga`) ON DELETE CASCADE ON UPDATE CASCADE;
