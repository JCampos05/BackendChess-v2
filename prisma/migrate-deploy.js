// Aplica las migraciones pendientes de Prisma en cada deploy. Se encadena en `npm run build` y en
// `npm start` (si ya están aplicadas, la segunda ejecución no hace nada). Solo aplica lo que falte:
// `prisma migrate deploy` es idempotente y nunca genera migraciones ni toca datos.
//
// Si falla, sale con código != 0 y el servidor NO arranca: Render conserva la versión anterior
// en línea en vez de dejar un backend nuevo contra un esquema desactualizado.
//
// Se escribe en JS plano (no TS) para no depender de tsx/ts-node en producción.
const { spawnSync } = require('node:child_process');

// Solo corre en Render (que define RENDER=true) o si se pide explícitamente con MIGRAR_BD=1:
// así un `npm run build` o `npm start` en local nunca migra la BD de su .env por accidente.
if (!process.env.RENDER && process.env.MIGRAR_BD !== '1') {
    console.log('[migrate-deploy] Fuera de Render: se omiten las migraciones (usar MIGRAR_BD=1 para forzarlas).');
    process.exit(0);
}

const prismaCli = require.resolve('prisma/build/index.js');
const resultado = spawnSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    encoding: 'utf8',
    env: process.env,
});

process.stdout.write(resultado.stdout || '');
process.stderr.write(resultado.stderr || '');

if (resultado.status === 0) {
    process.exit(0);
}

const salida = `${resultado.stdout || ''}${resultado.stderr || ''}`;

if (salida.includes('P3005')) {
    console.error(`
[migrate-deploy] La BD ya tiene tablas pero Prisma aún no tiene historial de migraciones (P3005).
Falta el "baseline" de una sola vez: marcar como aplicadas las migraciones que ya se ejecutaron
a mano, por ejemplo:

  npx prisma migrate resolve --applied <nombre_de_la_carpeta_en_prisma/migrations>

Después, cada deploy aplicará solo las migraciones nuevas. Ver notas-produccion.md.`);
} else if (salida.includes('P3009') || salida.includes('P3018')) {
    console.error('\n[migrate-deploy] Una migración falló o quedó a medias; revisar la BD antes de reintentar el deploy.');
}

process.exit(resultado.status || 1);
