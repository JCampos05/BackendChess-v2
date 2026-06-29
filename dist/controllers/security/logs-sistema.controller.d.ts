import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
export declare const getAll: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getEstadisticas: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getByEntidad: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
