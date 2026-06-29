import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
type Rol = 'adminGral' | 'adminTorneo';
export declare const requireRol: (...rolesPermitidos: Rol[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const soloAdminGral: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const cualquierAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export {};
