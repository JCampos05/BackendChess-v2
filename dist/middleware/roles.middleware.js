"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cualquierAdmin = exports.soloAdminGral = exports.requireRol = void 0;
// Middleware factory — verifica que el usuario tenga uno de los roles permitidos
// Uso: router.post('/', requireRol('adminGral'), controller.crear)
// Uso: router.get('/', requireRol('adminGral', 'adminTorneo'), controller.listar)
const requireRol = (...rolesPermitidos) => (req, res, next) => {
    if (!req.usuario) {
        res.status(401).json({
            ok: false,
            mensaje: 'No autenticado',
            code: 'UNAUTHORIZED',
        });
        return;
    }
    const rolUsuario = req.usuario.rol;
    if (!rolesPermitidos.includes(rolUsuario)) {
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
exports.requireRol = requireRol;
// Shorthand para rutas exclusivas de adminGral
exports.soloAdminGral = (0, exports.requireRol)('adminGral');
// Shorthand para rutas accesibles por cualquier admin autenticado
exports.cualquierAdmin = (0, exports.requireRol)('adminGral', 'adminTorneo');
//# sourceMappingURL=roles.middleware.js.map