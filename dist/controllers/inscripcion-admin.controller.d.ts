import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const crear: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getEventosActivos: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getCategoriasByTorneo: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getGruposByLiga: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const buscarJugador: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
