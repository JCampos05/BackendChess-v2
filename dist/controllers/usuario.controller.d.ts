import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const listarUsuarios: (_req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const obtenerUsuario: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const crearUsuario: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const actualizarUsuario: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const eliminarUsuario: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const cambiarPassword: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
