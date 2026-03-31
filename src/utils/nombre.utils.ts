// ── Capitalize Each Word ────────────────────────────────────
// Normaliza nombres de jugadores al formato estándar
// "CARLOS garcia lopez" → "Carlos Garcia Lopez"

// Palabras que NO se capitalizan en nombres en español
const EXCEPCIONES = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e']);

export const capitalizarNombre = (texto: string): string => {
    if (!texto) return '';

    return texto
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((palabra, index) => {
            // La primera palabra siempre se capitaliza
            if (index === 0) return capitalizar(palabra);
            // Palabras de excepción van en minúsculas (ej: "Juan de la Rosa")
            if (EXCEPCIONES.has(palabra)) return palabra;
            return capitalizar(palabra);
        })
        .join(' ');
};

const capitalizar = (palabra: string): string => {
    if (!palabra) return '';
    return palabra.charAt(0).toUpperCase() + palabra.slice(1);
};

// Normaliza todos los campos de nombre de un jugador
export const normalizarNombreJugador = (datos: {
    nombre: string;
    apellido1: string;
    apellido2?: string | null;
}): { nombre: string; apellido1: string; apellido2?: string } => {
    return {
        nombre: capitalizarNombre(datos.nombre),
        apellido1: capitalizarNombre(datos.apellido1),
        ...(datos.apellido2
            ? { apellido2: capitalizarNombre(datos.apellido2) }
            : {}),
    };
};

// Devuelve el nombre completo formateado
export const nombreCompleto = (
    nombre: string,
    apellido1: string,
    apellido2?: string | null
): string => {
    const partes = [nombre, apellido1, apellido2].filter(Boolean);
    return partes.join(' ');
};

// Verifica si dos jugadores son potencialmente el mismo
// (para validación de duplicados antes del constraint de BD)
export const mismoJugador = (
    a: { nombre: string; apellido1: string; apellido2?: string | null; fecha_nacimiento?: Date | null },
    b: { nombre: string; apellido1: string; apellido2?: string | null; fecha_nacimiento?: Date | null }
): boolean => {
    const nombreA = normalizarNombreJugador(a);
    const nombreB = normalizarNombreJugador(b);

    const nombresIguales =
        nombreA.nombre === nombreB.nombre &&
        nombreA.apellido1 === nombreB.apellido1 &&
        (nombreA.apellido2 ?? '') === (nombreB.apellido2 ?? '');

    if (!nombresIguales) return false;
    if (!a.fecha_nacimiento || !b.fecha_nacimiento) return nombresIguales;

    return (
        new Date(a.fecha_nacimiento).toISOString().split('T')[0] ===
        new Date(b.fecha_nacimiento).toISOString().split('T')[0]
    );
};