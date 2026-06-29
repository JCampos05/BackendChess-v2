"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                ok: false,
                mensaje: 'No se proporcionó token de autenticación',
                code: 'NO_TOKEN',
            });
            return;
        }
        // Verificar JWT
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (jwtError) {
            if (jwtError instanceof jsonwebtoken_1.default.TokenExpiredError) {
                // Marcar sesión como inactiva
                await database_1.default.sesionActiva.updateMany({
                    where: { token },
                    data: { activa: 0 },
                });
                res.status(401).json({
                    ok: false,
                    mensaje: 'Token expirado',
                    code: 'TOKEN_EXPIRED',
                });
                return;
            }
            res.status(401).json({
                ok: false,
                mensaje: 'Token inválido',
                code: 'TOKEN_INVALID',
            });
            return;
        }
        // Verificar que el usuario existe
        const usuario = await database_1.default.usuario.findUnique({
            where: { idUsuario: decoded.idUsuario },
            select: { idUsuario: true, telefono: true, rol: true, activo: true },
        });
        if (!usuario) {
            res.status(401).json({
                ok: false,
                mensaje: 'Usuario no encontrado',
                code: 'USER_NOT_FOUND',
            });
            return;
        }
        if (!usuario.activo) {
            res.status(401).json({
                ok: false,
                mensaje: 'Usuario desactivado',
                code: 'USER_DISABLED',
            });
            return;
        }
        // Verificar sesión activa y no expirada
        const sesion = await database_1.default.sesionActiva.findFirst({
            where: {
                token,
                activa: 1,
                OR: [
                    { fecha_expiracion: null },
                    { fecha_expiracion: { gt: new Date() } },
                ],
            },
        });
        if (!sesion) {
            res.status(401).json({
                ok: false,
                mensaje: 'Sesión inválida o expirada',
                code: 'SESSION_CLOSED',
            });
            return;
        }
        // Actualizar último acceso sin bloquear la petición
        database_1.default.sesionActiva
            .updateMany({
            where: { token },
            data: { ultimo_acceso: new Date() },
        })
            .catch(() => { });
        // Adjuntar datos al request
        req.usuario = {
            idUsuario: usuario.idUsuario,
            telefono: usuario.telefono,
            rol: usuario.rol,
        };
        req.token = token;
        req.idUsuario = usuario.idUsuario;
        req.sesion = sesion;
        next();
    }
    catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error en la autenticación',
            code: 'AUTH_ERROR',
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map