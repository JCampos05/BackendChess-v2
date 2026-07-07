import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral } from '../middleware/roles.middleware';
import * as usuarioController from '../controllers/usuario.controller';

// ════════════════════════════════════════════════════════════
// /api/usuarios — gestión de usuarios admin (solo adminGral)
// ════════════════════════════════════════════════════════════
const router = Router();

router.use(authMiddleware, soloAdminGral);

router.get   ('/',                       usuarioController.listarUsuarios);
router.get   ('/:id/torneos',            usuarioController.getTorneosAsignados);
router.get   ('/:id',                    usuarioController.obtenerUsuario);
router.post  ('/',                       usuarioController.crearUsuario);
router.put   ('/:id',                    usuarioController.actualizarUsuario);
router.delete('/:id',                    usuarioController.eliminarUsuario);
router.patch ('/:id/cambiar-password',   usuarioController.cambiarPassword);

export default router;
