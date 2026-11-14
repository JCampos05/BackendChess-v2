import { Request, Response, NextFunction } from 'express';
import { resolverRatingsEnDatos } from '../utils/rating.utils';

/**
 * Resuelve el campo `rating` de los jugadores en TODAS las respuestas JSON de la API (ver rating.utils.ts).
 * Se monta una sola vez en app.ts, antes de las rutas, en vez de tocar cada controlador. Si algo falla al resolver,
 * la respuesta se envía tal cual (nunca rompe una petición por esto).
 */
export const resolverRatingEnRespuestas = (_req: Request, res: Response, next: NextFunction): void => {
    const jsonOriginal = res.json.bind(res);
    res.json = ((cuerpo?: unknown) => {
        if (res.statusCode >= 400 || cuerpo === null || typeof cuerpo !== 'object') {
            return jsonOriginal(cuerpo);
        }
        resolverRatingsEnDatos(cuerpo)
            .then(resuelto => jsonOriginal(resuelto))
            .catch(err => {
                console.error('[rating] No se pudo resolver el rating de la respuesta:', err);
                jsonOriginal(cuerpo);
            });
        return res;
    }) as Response['json'];
    next();
};
