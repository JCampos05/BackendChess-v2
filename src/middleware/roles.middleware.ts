import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

type Rol = 'adminGral' | 'adminTorneo';

// Middleware factory — verifica que el usuario tenga uno de los roles permitidos
// Uso: router.post('/', requireRol('adminGral'), controller.crear)
// Uso: router.get('/', requireRol('adminGral', 'adminTorneo'), controller.listar)
export const requireRol = (...rolesPermitidos: Rol[]) =>
    (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.usuario) {
            res.status(401).json({
                ok: false,
                mensaje: 'No autenticado',
                code: 'UNAUTHORIZED',
            });
            return;
        }

        const rolUsuario = req.usuario.rol;

        if (!rolesPermitidos.includes(rolUsuario as Rol)) {
            res.status(403).json({
                ok: false,
                mensaje: `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
                code: 'FORBIDDEN',
                rol_actual: rolUsuario,
                roles_requeridos: rolesPermitidos,
            });
            return;
        }

        next();
    };

// Shorthand para rutas exclusivas de adminGral
export const soloAdminGral = requireRol('adminGral');

// Shorthand para rutas accesibles por cualquier admin autenticado
export const cualquierAdmin = requireRol('adminGral', 'adminTorneo');