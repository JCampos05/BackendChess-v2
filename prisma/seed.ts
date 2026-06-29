import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Sembrando datos de prueba...');

    // Crear usuario admin de prueba
    const usuarioAdmin = await prisma.usuario.upsert({
        where: { telefono: '6681234567' },
        update: {},
        create: {
            telefono: '6681234567',
            password: await bcrypt.hash('admin123', 10),
            rol: 'adminGral',
            activo: true,
            fecha_registro: new Date(),
            fecha_actualizacion: new Date(),
        },
    });

    console.log('✅ Usuario creado:', usuarioAdmin);

    // Crear usuario editor de prueba
    const usuarioEditor = await prisma.usuario.upsert({
        where: { telefono: '5559876543' },
        update: {},
        create: {
            telefono: '5559876543',
            password: await bcrypt.hash('admin123', 10),
            rol: 'adminTorneo',
            activo: true,
            fecha_registro: new Date(),
            fecha_actualizacion: new Date(),
        },
    });

    console.log('✅ Usuario editor creado:', usuarioEditor);

    // Crear zona horaria
    const zona = await prisma.zonaHoraria.upsert({
        where: { nombreZona: 'America/Mexico_City' },
        update: {},
        create: {
            idZonaHoraria: 1,
            nombreZona: 'America/Mexico_City',
            nombreMostrar: 'Ciudad de México (CDT)',
            offsetUTC: -5.0,
        },
    });

    console.log('✅ Zona horaria creada:', zona);

    // Crear un torneo de prueba
    const torneo = await prisma.torneo.create({
        data: {
            nombre: 'Torneo de Prueba',
            fecha: new Date('2026-07-15'),
            hora_inicio: '09:00:00',
            hora_fin: '18:00:00',
            lugar: 'Centro de Ajedrez Local',
            direccion: 'Calle Principal 123',
            estado: 'publicado',
            activo: true,
            es_actual: true,
            notas: 'Torneo de prueba local para desarrollo',
            idZonaHoraria: zona.idZonaHoraria,
            rondas: 5,
            fecha_creacion: new Date(),
            fecha_actualizacion: new Date(),
        },
    });

    console.log('✅ Torneo creado:', torneo);

    console.log('🎉 Datos de prueba sembrados exitosamente!');
    console.log('\n📱 Credenciales para pruebas:');
    console.log('Admin:');
    console.log('  Teléfono: 6681234567');
    console.log('  Contraseña: admin123');
    console.log('\nTorneo Admin:');
    console.log('  Teléfono: 5559876543');
    console.log('  Contraseña: admin123');
}

main()
    .catch((e) => {
        console.error('❌ Error al sembrar datos:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
