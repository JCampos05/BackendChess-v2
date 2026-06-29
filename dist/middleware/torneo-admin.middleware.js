"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarAccesoTorneo = void 0;
const database_1 = __importDefault(require("../config/database"));
// Verifica que un adminTorneo tenga acceso al torneo del parámetro de la ruta.
// adminGral siempre pasa — tiene acceso a todos los torneos.
// Por convención las rutas usan /:id — se puede pasar otro nombre si difiere.
const verificarAccesoTorneo = (paramName = 'id') => async (req, res, next) => {
    if (!req.usuario) {
        res.status(401).json({ ok: false, mensaje: 'No autenticado', code: 'UNAUTHORIZED' });
        return;
    }
    // adminGral tiene acceso total
    if (req.usuario.rol === 'adminGral') {
        next();
        return;
    }
    const idTorneo = Number(req.params[paramName]);
    if (isNaN(idTorneo)) {
        res.status(400).json({ ok: false, mensaje: 'ID de torneo inválido', code: 'INVALID_ID' });
        return;
    }
    try {
        // El modelo en Prisma se llama 'usuarioTorneo' (camelCase del @@map("usuario_torneo"))
        const asignacion = await database_1.default.usuarioTorneo.findUnique({
            where: {
                idUsuario_idTorneo: {
                    idUsuario: req.usuario.idUsuario,
                    idTorneo,
                },
            },
            select: { activo: true },
        });
        if (!asignacion?.activo) {
            res.status(403).json({
                ok: false,
                mensaje: 'No tienes acceso a este torneo',
                code: 'TORNEO_FORBIDDEN',
            });
            return;
        }
        next();
    }
    catch {
        res.status(500).json({
            ok: false,
            mensaje: 'Error al verificar acceso al torneo',
            code: 'AUTH_ERROR',
        });
    }
};
exports.verificarAccesoTorneo = verificarAccesoTorneo;
//# sourceMappingURL=torneo-admin.middleware.js.map