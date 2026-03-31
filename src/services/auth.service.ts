import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UAParser } from 'ua-parser-js';
import prisma from '../config/database';
import { JwtPayload } from '../types';
import {
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
} from '../middleware/error.middleware';
import {
    LoginDto,
    CambiarPasswordDto,
    CrearUsuarioDto,
} from '../validations/auth.validations';

const JWT_SECRET  = process.env.JWT_SECRET  ?? 'changeme';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN ?? '8h';
const SALT_ROUNDS = 10;

// ── Login ────────────────────────────────────────────────────

export const login = async (
    datos: LoginDto,
    ip: string,
    userAgent: string
) => {
    // Seleccionar explícitamente para tener rol y activo tipados
    const usuario = await prisma.usuario.findUnique({
        where: { telefono: datos.telefono },
        select: {
            idUsuario: true,
            telefono:  true,
            password:  true,
            rol:       true,
            activo:    true,
        },
    });

    if (!usuario) {
        await _registrarAcceso({ idUsuario: null, tipo: 'login_fallido', ip, userAgent });
        throw new UnauthorizedError('Teléfono o contraseña incorrectos');
    }

    if (!usuario.activo) {
        throw new ForbiddenError('La cuenta está desactivada');
    }

    const passwordOk = await bcrypt.compare(datos.password, usuario.password);
    if (!passwordOk) {
        await _registrarAcceso({ idUsuario: usuario.idUsuario, tipo: 'login_fallido', ip, userAgent });
        throw new UnauthorizedError('Teléfono o contraseña incorrectos');
    }

    // Generar token con rol incluido
    const payload: JwtPayload = {
        idUsuario: usuario.idUsuario,
        telefono:  usuario.telefono,
        rol:       usuario.rol,
    };
    const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES } as jwt.SignOptions
    );

    const expiracion = _calcularExpiracion(JWT_EXPIRES);

    // Crear sesión
    const sesion = await prisma.sesionActiva.create({
        data: {
            idUsuario:        usuario.idUsuario,
            token,
            ip,
            navegador:        _parsearNavegador(userAgent),
            dispositivo:      _parsearDispositivo(userAgent),
            ultimo_acceso:    new Date(),
            fecha_expiracion: expiracion,
            activa:           1,
        },
    });

    await prisma.usuario.update({
        where: { idUsuario: usuario.idUsuario },
        data:  { ultimo_acceso: new Date() },
    });

    await _registrarAcceso({ idUsuario: usuario.idUsuario, tipo: 'login_exitoso', ip, userAgent });

    return {
        token,
        idSesion: sesion.idSesion,
        usuario: {
            idUsuario: usuario.idUsuario,
            telefono:  usuario.telefono,
            rol:       usuario.rol,
        },
    };
};

// ── Logout ───────────────────────────────────────────────────
// Recibe token (string) — el controller tiene req.token disponible

export const logout = async (
    token: string,
    idUsuario: number,
    ip: string,
    userAgent: string
) => {
    await prisma.sesionActiva.updateMany({
        where: { token, idUsuario },
        data:  { activa: 0 },
    });
    await _registrarAcceso({ idUsuario, tipo: 'logout', ip, userAgent });
    return { ok: true };
};

export const logoutTodas = async (
    idUsuario: number,
    ip: string,
    userAgent: string
) => {
    await prisma.sesionActiva.updateMany({
        where: { idUsuario, activa: 1 },
        data:  { activa: 0 },
    });
    await _registrarAcceso({ idUsuario, tipo: 'logout', ip, userAgent });
    return { ok: true };
};

// ── Sesiones activas ─────────────────────────────────────────

export const obtenerSesiones = async (idUsuario: number) => {
    return prisma.sesionActiva.findMany({
        where:   { idUsuario, activa: 1 },
        select: {
            idSesion:         true,
            ip:               true,
            navegador:        true,
            dispositivo:      true,
            ultimo_acceso:    true,
            fecha_expiracion: true,
        },
        orderBy: { ultimo_acceso: 'desc' },
    });
};

// ── Cambiar contraseña ───────────────────────────────────────

export const cambiarPassword = async (
    idUsuario: number,
    datos: CambiarPasswordDto
) => {
    const usuario = await prisma.usuario.findUnique({
        where:  { idUsuario },
        select: { idUsuario: true, password: true },
    });
    if (!usuario) throw new NotFoundError('Usuario no encontrado');

    const ok = await bcrypt.compare(datos.password_actual, usuario.password);
    if (!ok) throw new UnauthorizedError('La contraseña actual es incorrecta');

    const hash = await bcrypt.hash(datos.password_nueva, SALT_ROUNDS);

    await prisma.usuario.update({
        where: { idUsuario },
        data:  { password: hash, fecha_actualizacion: new Date() },
    });

    await prisma.sesionActiva.updateMany({
        where: { idUsuario, activa: 1 },
        data:  { activa: 0 },
    });

    return { ok: true, mensaje: 'Contraseña actualizada. Inicia sesión nuevamente.' };
};

// ── Crear usuario ────────────────────────────────────────────

export const crearUsuario = async (datos: CrearUsuarioDto) => {
    const existe = await prisma.usuario.findUnique({
        where: { telefono: datos.telefono },
    });
    if (existe) throw new ConflictError('Ya existe un usuario con ese teléfono');

    const hash = await bcrypt.hash(datos.password, SALT_ROUNDS);

    return prisma.usuario.create({
        data: {
            telefono:            datos.telefono,
            password:            hash,
            rol:                 datos.rol,
            activo:              true,
            fecha_registro:      new Date(),
            fecha_actualizacion: new Date(),
        },
        select: {
            idUsuario:      true,
            telefono:       true,
            rol:            true,
            activo:         true,
            fecha_registro: true,
        },
    });
};

// ── Listar usuarios ──────────────────────────────────────────

export const listarUsuarios = async () => {
    return prisma.usuario.findMany({
        select: {
            idUsuario:         true,
            telefono:          true,
            rol:               true,
            activo:            true,
            ultimo_acceso:     true,
            fecha_registro:    true,
            torneos_asignados: {
                where:  { activo: true },
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

// ── Toggle activo ────────────────────────────────────────────

export const toggleUsuario = async (idUsuario: number, activo: boolean) => {
    const usuario = await prisma.usuario.findUnique({ where: { idUsuario } });
    if (!usuario) return null;

    if (!activo) {
        await prisma.sesionActiva.updateMany({
            where: { idUsuario, activa: 1 },
            data:  { activa: 0 },
        });
    }

    return prisma.usuario.update({
        where: { idUsuario },
        data:  { activo, fecha_actualizacion: new Date() },
        select: { idUsuario: true, telefono: true, rol: true, activo: true },
    });
};

// ── Helpers privados ─────────────────────────────────────────
const _registrarAcceso = async (params: {
    idUsuario: number | null;
    tipo: 'login_exitoso' | 'login_fallido' | 'logout' | 'otro';
    ip: string;
    userAgent: string;
}) => {
    try {
        const { idUsuario, tipo, ip, userAgent } = params;

        await prisma.historialAcceso.create({
            data: {
                idUsuario:   idUsuario ?? undefined,   
                tipo,
                ip,
                navegador:   _parsearNavegador(userAgent),
                dispositivo: _parsearDispositivo(userAgent),
                fecha:       new Date(),
            },
        });
    } catch {
        // No propagamos errores de auditoría
    }
};

const _parsearUA = (ua: string) => new UAParser(ua).getResult();

const _parsearNavegador = (ua: string): string => {
    const r = _parsearUA(ua);
    return `${r.browser.name ?? 'Desconocido'} ${r.browser.version ?? ''}`.trim();
};

const _parsearDispositivo = (ua: string): string => {
    const r = _parsearUA(ua);
    const os     = `${r.os.name ?? ''} ${r.os.version ?? ''}`.trim();
    const device = r.device.type ?? 'desktop';
    return `${device} — ${os}`;
};

const _calcularExpiracion = (expires: string): Date => {
    const match = expires.match(/^(\d+)([hmd])$/);
    if (!match) return new Date(Date.now() + 8 * 3600 * 1000);
    const valor   = parseInt(match[1]);
    const unidad  = match[2];
    const ms = unidad === 'h' ? valor * 3_600_000
             : unidad === 'd' ? valor * 86_400_000
             : valor * 60_000;
    return new Date(Date.now() + ms);
};