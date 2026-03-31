import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JwtPayload } from '../types';
import prisma from '../config/database';

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
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
        let decoded: JwtPayload;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        } catch (jwtError) {
            if (jwtError instanceof jwt.TokenExpiredError) {
                // Marcar sesión como inactiva
                await prisma.sesionActiva.updateMany({
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
        const usuario = await prisma.usuario.findUnique({
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
        const sesion = await prisma.sesionActiva.findFirst({
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
        prisma.sesionActiva
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
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: 'Error en la autenticación',
            code: 'AUTH_ERROR',
        });
    }
};