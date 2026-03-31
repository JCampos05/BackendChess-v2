import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral } from '../middleware/roles.middleware';
import * as configController from '../controllers/config.controller';

const router = Router();

// ── Públicas — sin autenticación ─────────────────────────────

// Info pública del comité (nombre, redes, contacto)
router.get('/', configController.obtenerConfig);

// Catálogos — el frontend los usa en formularios de inscripción
router.get('/zonas-horarias', configController.listarZonasHorarias);
router.get('/categorias', configController.listarCategorias);
router.get('/ritmos-juego', configController.listarRitmosJuego);
router.get('/sistemas-competencia', configController.listarSistemasCompetencia);
router.get('/sistemas-desempate', configController.listarSistemasDesempate);
router.get('/sistemas-pago', configController.listarSistemasPago);
router.get('/patrocinadores', configController.listarPatrocinadores);

// ── Solo adminGral ────────────────────────────────────────────

router.get('/completa', authMiddleware, soloAdminGral, configController.obtenerConfigCompleta);
router.patch('/', authMiddleware, soloAdminGral, configController.actualizarConfig);

export default router;