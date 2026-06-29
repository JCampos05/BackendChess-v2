import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral, cualquierAdmin } from '../middleware/roles.middleware';
import { verificarAccesoTorneo } from '../middleware/torneo-admin.middleware';
import * as ctrl from '../controllers/torneo.controller';

const router = Router();

// ── Públicas — sin autenticación ─────────────────────────────
// El frontend público usa estas rutas para la landing
router.get('/publicos', ctrl.listarTorneosPublicos);
router.get('/activos', ctrl.listarTorneosActivos);

// ── Autenticadas ──────────────────────────────────────────────
router.use(authMiddleware);

router.get('/',    cualquierAdmin, ctrl.listarTorneos);
router.get('/:id', cualquierAdmin, ctrl.obtenerTorneo);

// ── CRUD exclusivo adminGral ──────────────────────────────────
router.post  ('/',    soloAdminGral, ctrl.crearTorneo);
router.put   ('/:id', soloAdminGral, ctrl.actualizarTorneo);
router.delete('/:id', soloAdminGral, ctrl.eliminarTorneo);

// ── Estado ────────────────────────────────────────────────────
router.patch('/:id/estado',    soloAdminGral, ctrl.cambiarEstado);
router.patch('/:id/activo',    soloAdminGral, ctrl.toggleActivo);
router.patch('/:id/es-actual', soloAdminGral, ctrl.toggleEsActual);

// ── Categorías (adminGral o adminTorneo asignado) ─────────────
router.post  ('/:id/categorias',               verificarAccesoTorneo(), ctrl.asignarCategoria);
router.put   ('/:id/categorias/:idCategoria',  verificarAccesoTorneo(), ctrl.actualizarCategoria);
router.delete('/:id/categorias/:idCategoria',  verificarAccesoTorneo(), ctrl.desasignarCategoria);

// ── Patrocinadores ────────────────────────────────────────────
router.get   ('/:id/patrocinadores',                 soloAdminGral, ctrl.listarPatrocinadores);
router.post  ('/:id/patrocinadores',                 soloAdminGral, ctrl.asignarPatrocinador);
router.delete('/:id/patrocinadores/:idPatrocinador', soloAdminGral, ctrl.removerPatrocinador);

// ── Admins asignados ──────────────────────────────────────────
router.post  ('/:id/admins',            soloAdminGral, ctrl.asignarAdmin);
router.delete('/:id/admins/:idUsuario', soloAdminGral, ctrl.removerAdmin);

export default router;