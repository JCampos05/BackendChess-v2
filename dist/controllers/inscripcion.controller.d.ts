import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const listarPorTorneo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const listarPorJugador: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerUna: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const crear: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizar: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const confirmarPago: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cancelar: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
