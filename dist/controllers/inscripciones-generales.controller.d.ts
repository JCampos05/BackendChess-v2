import { Request, Response, NextFunction } from 'express';
export declare const getResumenGeneral: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEvolucionTemporal: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getResumenTorneos: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getInscripcionesPorTorneo: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getDistribucionCategoria: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTorneosSelector: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
