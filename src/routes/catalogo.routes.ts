import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { soloAdminGral } from '../middleware/roles.middleware';
import * as Cat from '../controllers/catalogo.controller';

// ════════════════════════════════════════════════════════════
// /api/categorias
// ════════════════════════════════════════════════════════════
export const categoriaRouter = Router();

categoriaRouter.get('/', Cat.getAllCategorias);
categoriaRouter.get('/:id', Cat.getCategoriaById);
categoriaRouter.post('/', authMiddleware, soloAdminGral, Cat.createCategoria);
categoriaRouter.put('/:id', authMiddleware, soloAdminGral, Cat.updateCategoria);
categoriaRouter.delete('/:id', authMiddleware, soloAdminGral, Cat.deleteCategoria);

// ════════════════════════════════════════════════════════════
// /api/ritmos-juego
// ════════════════════════════════════════════════════════════
export const ritmoJuegoRouter = Router();

ritmoJuegoRouter.get('/', Cat.getAllRitmos);
ritmoJuegoRouter.get('/:id', Cat.getRitmoById);
ritmoJuegoRouter.post('/', authMiddleware, soloAdminGral, Cat.createRitmo);
ritmoJuegoRouter.put('/:id', authMiddleware, soloAdminGral, Cat.updateRitmo);
ritmoJuegoRouter.delete('/:id', authMiddleware, soloAdminGral, Cat.deleteRitmo);

// ════════════════════════════════════════════════════════════
// /api/sistemas-competencia
// ════════════════════════════════════════════════════════════
export const sistemaCompetenciaRouter = Router();

sistemaCompetenciaRouter.get('/', Cat.getAllSistemasCompetencia);
sistemaCompetenciaRouter.get('/:id', Cat.getSistemaCompetenciaById);
sistemaCompetenciaRouter.post('/', authMiddleware, soloAdminGral, Cat.createSistemaCompetencia);
sistemaCompetenciaRouter.put('/:id', authMiddleware, soloAdminGral, Cat.updateSistemaCompetencia);
sistemaCompetenciaRouter.delete('/:id', authMiddleware, soloAdminGral, Cat.deleteSistemaCompetencia);

// ════════════════════════════════════════════════════════════
// /api/sistemas-desempate
// ════════════════════════════════════════════════════════════
export const sistemaDesempateRouter = Router();

sistemaDesempateRouter.get('/', Cat.getAllSistemasDesempate);
sistemaDesempateRouter.get('/:id', Cat.getSistemaDesempateById);
sistemaDesempateRouter.post('/', authMiddleware, soloAdminGral, Cat.createSistemaDesempate);
sistemaDesempateRouter.put('/:id', authMiddleware, soloAdminGral, Cat.updateSistemaDesempate);
sistemaDesempateRouter.delete('/:id', authMiddleware, soloAdminGral, Cat.deleteSistemaDesempate);

// ════════════════════════════════════════════════════════════
// /api/sistema-pago
// ════════════════════════════════════════════════════════════
export const sistemaPagoRouter = Router();

// Públicas — orden: rutas estáticas antes que dinámicas
sistemaPagoRouter.get('/activos', Cat.getSistemasPagoActivos);

// Protegidas — solo adminGral gestiona cuentas de pago
sistemaPagoRouter.get('/', authMiddleware, soloAdminGral, Cat.getAllSistemasPago);
sistemaPagoRouter.post('/', authMiddleware, soloAdminGral, Cat.createSistemaPago);
sistemaPagoRouter.put('/:id', authMiddleware, soloAdminGral, Cat.updateSistemaPago);
sistemaPagoRouter.delete('/:id', authMiddleware, soloAdminGral, Cat.deleteSistemaPago);
sistemaPagoRouter.patch('/:id/toggle', authMiddleware, soloAdminGral, Cat.toggleActiveSistemaPago);

// Pública dinámica — al final para no colisionar con /activos
sistemaPagoRouter.get('/:id', Cat.getSistemaPagoById);