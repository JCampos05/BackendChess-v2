import { Router, Request, Response, NextFunction } from 'express';
import { verificarFolioPublico } from '../services/verificacion-folio.service';

// ════════════════════════════════════════════════════════════
// /api/verificar-folio — pública, sin authMiddleware.
// La usa la página /verificar (a la que apunta el QR del comprobante).
// ════════════════════════════════════════════════════════════
const router = Router();

// Limitador mínimo en memoria (por IP) para que no se pueda recorrer folios a ritmo de script.
const VENTANA_MS = 60_000;
const MAX_POR_VENTANA = 30;
const intentos = new Map<string, { cuenta: number; desde: number }>();

// Detrás del proxy de Render `req.ip` es siempre el del proxy (compartido por todos), así que se usa la
// última entrada de X-Forwarded-For: la agrega el propio proxy y el cliente no puede falsificarla.
const ipCliente = (req: Request): string => {
    const reenviado = req.headers['x-forwarded-for'];
    const lista = (Array.isArray(reenviado) ? reenviado.join(',') : reenviado ?? '').split(',');
    return lista[lista.length - 1].trim() || req.ip || 'desconocida';
};

const limitar = (req: Request, res: Response, next: NextFunction): void => {
    const ip = ipCliente(req);
    const ahora = Date.now();

    if (intentos.size > 5000) {
        for (const [clave, registro] of intentos) {
            if (ahora - registro.desde > VENTANA_MS) intentos.delete(clave);
        }
    }
    const registro = intentos.get(ip);

    if (!registro || ahora - registro.desde > VENTANA_MS) {
        intentos.set(ip, { cuenta: 1, desde: ahora });
        next();
        return;
    }
    registro.cuenta++;
    if (registro.cuenta > MAX_POR_VENTANA) {
        res.status(429).json({ ok: false, mensaje: 'Demasiadas consultas. Intenta de nuevo en un minuto.' });
        return;
    }
    next();
};

// GET /api/verificar-folio/:folio?k=<codigo del QR>
router.get('/:folio', limitar, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const codigo = typeof req.query.k === 'string' ? req.query.k : undefined;
        const data = await verificarFolioPublico(req.params.folio, codigo);
        res.json({ ok: true, data });
    } catch (err) { next(err); }
});

export default router;
