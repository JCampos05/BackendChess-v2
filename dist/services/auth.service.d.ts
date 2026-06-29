import { LoginDto, CambiarPasswordDto, CrearUsuarioDto } from '../validations/auth.validations';
export declare const login: (datos: LoginDto, ip: string, userAgent: string) => Promise<{
    token: string;
    idSesion: number;
    usuario: {
        idUsuario: number;
        telefono: string;
        rol: import(".prisma/client").$Enums.RolUsuario;
    };
}>;
export declare const logout: (token: string, idUsuario: number, ip: string, userAgent: string) => Promise<{
    ok: boolean;
}>;
export declare const logoutTodas: (idUsuario: number, ip: string, userAgent: string) => Promise<{
    ok: boolean;
}>;
export declare const obtenerSesiones: (idUsuario: number) => Promise<{
    ip: string | null;
    navegador: string | null;
    dispositivo: string | null;
    ultimo_acceso: Date;
    fecha_expiracion: Date | null;
    idSesion: number;
}[]>;
export declare const cambiarPassword: (idUsuario: number, datos: CambiarPasswordDto) => Promise<{
    ok: boolean;
    mensaje: string;
}>;
export declare const crearUsuario: (datos: CrearUsuarioDto) => Promise<{
    idUsuario: number;
    telefono: string;
    rol: import(".prisma/client").$Enums.RolUsuario;
    activo: boolean;
    fecha_registro: Date | null;
}>;
export declare const listarUsuarios: () => Promise<{
    ultimo_acceso: Date | null;
    idUsuario: number;
    telefono: string;
    rol: import(".prisma/client").$Enums.RolUsuario;
    activo: boolean;
    fecha_registro: Date | null;
    torneos_asignados: {
        torneo: {
            idTorneo: number;
            nombre: string | null;
            fecha: Date;
        };
    }[];
}[]>;
export declare const obtenerUsuarioPorId: (idUsuario: number) => Promise<{
    ultimo_acceso: Date | null;
    idUsuario: number;
    telefono: string;
    rol: import(".prisma/client").$Enums.RolUsuario;
    activo: boolean;
    fecha_registro: Date | null;
}>;
export declare const toggleUsuario: (idUsuario: number, activo: boolean) => Promise<{
    idUsuario: number;
    telefono: string;
    rol: import(".prisma/client").$Enums.RolUsuario;
    activo: boolean;
} | null>;
