import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../types';
export declare const getActivas: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getByUsuario: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cerrarSesion: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cerrarTodasUsuario: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const limpiarExpiradas: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
