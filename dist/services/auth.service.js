"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUsuario = exports.obtenerUsuarioPorId = exports.listarUsuarios = exports.crearUsuario = exports.cambiarPassword = exports.obtenerSesiones = exports.logoutTodas = exports.logout = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ua_parser_js_1 = require("ua-parser-js");
const database_1 = __importDefault(require("../config/database"));
const error_middleware_1 = require("../middleware/error.middleware");
const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? '8h';
const SALT_ROUNDS = 10;
// ── Login ────────────────────────────────────────────────────
const login = async (datos, ip, userAgent) => {
    // Seleccionar explícitamente para tener rol y activo tipados
    const usuario = await database_1.default.usuario.findUnique({
        where: { telefono: datos.telefono },
        select: {
            idUsuario: true,
            telefono: true,
            password: true,
            rol: true,
            activo: true,
        },
    });
    if (!usuario) {
        await _registrarAcceso({ idUsuario: null, tipo: 'login_fallido', ip, userAgent });
        throw new error_middleware_1.UnauthorizedError('Teléfono o contraseña incorrectos');
    }
    if (!usuario.activo) {
        throw new error_middleware_1.ForbiddenError('La cuenta está desactivada');
    }
    const passwordOk = await bcrypt_1.default.compare(datos.password, usuario.password);
    if (!passwordOk) {
        await _registrarAcceso({ idUsuario: usuario.idUsuario, tipo: 'login_fallido', ip, userAgent });
        throw new error_middleware_1.UnauthorizedError('Teléfono o contraseña incorrectos');
    }
    // Generar token con rol incluido
    const payload = {
        idUsuario: usuario.idUsuario,
        telefono: usuario.telefono,
        rol: usuario.rol,
    };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    const expiracion = _calcularExpiracion(JWT_EXPIRES);
    // Crear sesión
    const sesion = await database_1.default.sesionActiva.create({
        data: {
            idUsuario: usuario.idUsuario,
            token,
            ip,
            navegador: _parsearNavegador(userAgent),
            dispositivo: _parsearDispositivo(userAgent),
            ultimo_acceso: new Date(),
            fecha_expiracion: expiracion,
            activa: 1,
        },
    });
    await database_1.default.usuario.update({
        where: { idUsuario: usuario.idUsuario },
        data: { ultimo_acceso: new Date() },
    });
    await _registrarAcceso({ idUsuario: usuario.idUsuario, tipo: 'login_exitoso', ip, userAgent });
    return {
        token,
        idSesion: sesion.idSesion,
        usuario: {
            idUsuario: usuario.idUsuario,
            telefono: usuario.telefono,
            rol: usuario.rol,
        },
    };
};
exports.login = login;
// ── Logout ───────────────────────────────────────────────────
// Recibe token (string) — el controller tiene req.token disponible
const logout = async (token, idUsuario, ip, userAgent) => {
    await database_1.default.sesionActiva.updateMany({
        where: { token, idUsuario },
        data: { activa: 0 },
    });
    await _registrarAcceso({ idUsuario, tipo: 'logout', ip, userAgent });
    return { ok: true };
};
exports.logout = logout;
const logoutTodas = async (idUsuario, ip, userAgent) => {
    await database_1.default.sesionActiva.updateMany({
        where: { idUsuario, activa: 1 },
        data: { activa: 0 },
    });
    await _registrarAcceso({ idUsuario, tipo: 'logout', ip, userAgent });
    return { ok: true };
};
exports.logoutTodas = logoutTodas;
// ── Sesiones activas ─────────────────────────────────────────
const obtenerSesiones = async (idUsuario) => {
    return database_1.default.sesionActiva.findMany({
        where: { idUsuario, activa: 1 },
        select: {
            idSesion: true,
            ip: true,
            navegador: true,
            dispositivo: true,
            ultimo_acceso: true,
            fecha_expiracion: true,
        },
        orderBy: { ultimo_acceso: 'desc' },
    });
};
exports.obtenerSesiones = obtenerSesiones;
// ── Cambiar contraseña ───────────────────────────────────────
const cambiarPassword = async (idUsuario, datos) => {
    const usuario = await database_1.default.usuario.findUnique({
        where: { idUsuario },
        select: { idUsuario: true, password: true },
    });
    if (!usuario)
        throw new error_middleware_1.NotFoundError('Usuario no encontrado');
    const ok = await bcrypt_1.default.compare(datos.password_actual, usuario.password);
    if (!ok)
        throw new error_middleware_1.UnauthorizedError('La contraseña actual es incorrecta');
    const hash = await bcrypt_1.default.hash(datos.password_nueva, SALT_ROUNDS);
    await database_1.default.usuario.update({
        where: { idUsuario },
        data: { password: hash, fecha_actualizacion: new Date() },
    });
    await database_1.default.sesionActiva.updateMany({
        where: { idUsuario, activa: 1 },
        data: { activa: 0 },
    });
    return { ok: true, mensaje: 'Contraseña actualizada. Inicia sesión nuevamente.' };
};
exports.cambiarPassword = cambiarPassword;
// ── Crear usuario ────────────────────────────────────────────
const crearUsuario = async (datos) => {
    const existe = await database_1.default.usuario.findUnique({
        where: { telefono: datos.telefono },
    });
    if (existe)
        throw new error_middleware_1.ConflictError('Ya existe un usuario con ese teléfono');
    const hash = await bcrypt_1.default.hash(datos.password, SALT_ROUNDS);
    return database_1.default.usuario.create({
        data: {
            telefono: datos.telefono,
            password: hash,
            rol: datos.rol,
            activo: true,
            fecha_registro: new Date(),
            fecha_actualizacion: new Date(),
        },
        select: {
            idUsuario: true,
            telefono: true,
            rol: true,
            activo: true,
            fecha_registro: true,
        },
    });
};
exports.crearUsuario = crearUsuario;
// ── Listar usuarios ──────────────────────────────────────────
const listarUsuarios = async () => {
    return database_1.default.usuario.findMany({
        select: {
            idUsuario: true,
            telefono: true,
            rol: true,
            activo: true,
            ultimo_acceso: true,
            fecha_registro: true,
            torneos_asignados: {
                where: { activo: true },
                select: {
                    torneo: {
                        select: { idTorneo: true, nombre: true, fecha: true },
                    },
                },
            },
        },
        orderBy: { fecha_registro: 'desc' },
    });
};
exports.listarUsuarios = listarUsuarios;
// ── Obtener usuario por ID ──────────────────────────────────
const obtenerUsuarioPorId = async (idUsuario) => {
    const usuario = await database_1.default.usuario.findUnique({
        where: { idUsuario },
        select: {
            idUsuario: true,
            telefono: true,
            rol: true,
            activo: true,
            ultimo_acceso: true,
            fecha_registro: true,
        },
    });
    if (!usuario)
        throw new error_middleware_1.NotFoundError('Usuario no encontrado');
    return usuario;
};
exports.obtenerUsuarioPorId = obtenerUsuarioPorId;
// ── Toggle activo ────────────────────────────────────────────
const toggleUsuario = async (idUsuario, activo) => {
    const usuario = await database_1.default.usuario.findUnique({ where: { idUsuario } });
    if (!usuario)
        return null;
    if (!activo) {
        await database_1.default.sesionActiva.updateMany({
            where: { idUsuario, activa: 1 },
            data: { activa: 0 },
        });
    }
    return database_1.default.usuario.update({
        where: { idUsuario },
        data: { activo, fecha_actualizacion: new Date() },
        select: { idUsuario: true, telefono: true, rol: true, activo: true },
    });
};
exports.toggleUsuario = toggleUsuario;
// ── Helpers privados ─────────────────────────────────────────
const _registrarAcceso = async (params) => {
    try {
        const { idUsuario, tipo, ip, userAgent } = params;
        await database_1.default.historialAcceso.create({
            data: {
                idUsuario: idUsuario ?? undefined,
                tipo,
                ip,
                navegador: _parsearNavegador(userAgent),
                dispositivo: _parsearDispositivo(userAgent),
                fecha: new Date(),
            },
        });
    }
    catch {
        // No propagamos errores de auditoría
    }
};
const _parsearUA = (ua) => new ua_parser_js_1.UAParser(ua).getResult();
const _parsearNavegador = (ua) => {
    const r = _parsearUA(ua);
    return `${r.browser.name ?? 'Desconocido'} ${r.browser.version ?? ''}`.trim();
};
const _parsearDispositivo = (ua) => {
    const r = _parsearUA(ua);
    const os = `${r.os.name ?? ''} ${r.os.version ?? ''}`.trim();
    const device = r.device.type ?? 'desktop';
    return `${device} — ${os}`;
};
const _calcularExpiracion = (expires) => {
    const match = expires.match(/^(\d+)([hmd])$/);
    if (!match)
        return new Date(Date.now() + 8 * 3600 * 1000);
    const valor = parseInt(match[1]);
    const unidad = match[2];
    const ms = unidad === 'h' ? valor * 3600000
        : unidad === 'd' ? valor * 86400000
            : valor * 60000;
    return new Date(Date.now() + ms);
};
//# sourceMappingURL=auth.service.js.map