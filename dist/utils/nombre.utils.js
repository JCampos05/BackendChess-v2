"use strict";
// ── Capitalize Each Word ────────────────────────────────────
// Normaliza nombres de jugadores al formato estándar
// "CARLOS garcia lopez" → "Carlos Garcia Lopez"
Object.defineProperty(exports, "__esModule", { value: true });
exports.mismoJugador = exports.nombreCompleto = exports.normalizarNombreJugador = exports.capitalizarNombre = void 0;
// Palabras que NO se capitalizan en nombres en español
const EXCEPCIONES = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e']);
const capitalizarNombre = (texto) => {
    if (!texto)
        return '';
    return texto
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map((palabra, index) => {
        // La primera palabra siempre se capitaliza
        if (index === 0)
            return capitalizar(palabra);
        // Palabras de excepción van en minúsculas (ej: "Juan de la Rosa")
        if (EXCEPCIONES.has(palabra))
            return palabra;
        return capitalizar(palabra);
    })
        .join(' ');
};
exports.capitalizarNombre = capitalizarNombre;
const capitalizar = (palabra) => {
    if (!palabra)
        return '';
    return palabra.charAt(0).toUpperCase() + palabra.slice(1);
};
// Normaliza todos los campos de nombre de un jugador
const normalizarNombreJugador = (datos) => {
    return {
        nombre: (0, exports.capitalizarNombre)(datos.nombre),
        apellido1: (0, exports.capitalizarNombre)(datos.apellido1),
        ...(datos.apellido2
            ? { apellido2: (0, exports.capitalizarNombre)(datos.apellido2) }
            : {}),
    };
};
exports.normalizarNombreJugador = normalizarNombreJugador;
// Devuelve el nombre completo formateado
const nombreCompleto = (nombre, apellido1, apellido2) => {
    const partes = [nombre, apellido1, apellido2].filter(Boolean);
    return partes.join(' ');
};
exports.nombreCompleto = nombreCompleto;
// Verifica si dos jugadores son potencialmente el mismo
// (para validación de duplicados antes del constraint de BD)
const mismoJugador = (a, b) => {
    const nombreA = (0, exports.normalizarNombreJugador)(a);
    const nombreB = (0, exports.normalizarNombreJugador)(b);
    const nombresIguales = nombreA.nombre === nombreB.nombre &&
        nombreA.apellido1 === nombreB.apellido1 &&
        (nombreA.apellido2 ?? '') === (nombreB.apellido2 ?? '');
    if (!nombresIguales)
        return false;
    if (!a.fecha_nacimiento || !b.fecha_nacimiento)
        return nombresIguales;
    return (new Date(a.fecha_nacimiento).toISOString().split('T')[0] ===
        new Date(b.fecha_nacimiento).toISOString().split('T')[0]);
};
exports.mismoJugador = mismoJugador;
//# sourceMappingURL=nombre.utils.js.map