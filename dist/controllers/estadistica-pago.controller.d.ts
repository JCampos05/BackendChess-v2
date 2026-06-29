import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const getEstadisticasGenerales: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getEstadisticasPorCategoria: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getEstadisticasPorTorneo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getEvolucionTemporal: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getComparativaAnual: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
