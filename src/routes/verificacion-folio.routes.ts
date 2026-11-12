import { Router, Request, Response, NextFunction } from 'express';
import { verificarFolioPublico } from '../services/verificacion-folio.service';
import { limitadorVerificacionFolio } from '../middleware/rate-limit.middleware';

// ════════════════════════════════════════════════════════════
// /api/verificar-folio — pública, sin authMiddleware.
// La usa la página /verificar (a la que apunta el QR del comprobante).
// ════════════════════════════════════════════════════════════
const router = Router();

// El límite por IP (30 consultas por minuto) está en el middleware común de rate limiting; evita recorrer folios.

// GET /api/verificar-folio/:folio?k=<codigo del QR>
router.get('/:folio', limitadorVerificacionFolio, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const codigo = typeof req.query.k === 'string' ? req.query.k : undefined;
        const data = await verificarFolioPublico(req.params.folio, codigo);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
});

export default router;
