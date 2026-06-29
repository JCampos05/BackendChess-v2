import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const verificarAccesoTorneo: (paramName?: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
