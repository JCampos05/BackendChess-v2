// Rango Unicode de marcas diacríticas combinantes (acentos sueltos tras
// normalize('NFD')) construido por código de punto para evitar problemas de
// codificación con caracteres combinantes literales en el archivo fuente.
const DIACRITICOS = new RegExp(
    `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
    'g'
);

/** Convierte texto libre en un slug URL-safe: minúsculas, sin acentos, espacios/símbolos → guiones. */
export const slugify = (texto: string): string => {
    return texto
        .normalize('NFD').replace(DIACRITICOS, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 200);
};

/**
 * Genera un slug único a partir de `base`, probando sufijos -2, -3... contra
 * `existeSlug` (típicamente una consulta a BD) hasta encontrar uno libre.
 * `ignorarSlugActual` evita que una actualización choque consigo misma
 * (el slug ya usado por el propio registro no cuenta como colisión).
 */
export const generarSlugUnico = async (
    base: string,
    existeSlug: (slug: string) => Promise<boolean>,
    ignorarSlugActual?: string
): Promise<string> => {
    const slugBase = slugify(base) || 'sin-nombre';
    let slug = slugBase;
    let sufijo = 2;

    while (slug !== ignorarSlugActual && await existeSlug(slug)) {
        slug = `${slugBase}-${sufijo}`;
        sufijo++;
    }

    return slug;
};
