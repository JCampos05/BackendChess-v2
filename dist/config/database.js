"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const isProduction = process.env.DB_MODE === 'production';
const DATABASE_URL = isProduction
    ? `mysql://${process.env.DB_USER_PROD}:${process.env.DB_PASSWORD_PROD}@${process.env.DB_HOST_PROD}:${process.env.DB_PORT_PROD}/${process.env.DB_NAME_PROD}`
    : `mysql://${process.env.DB_USER_LOCAL}:${process.env.DB_PASSWORD_LOCAL}@${process.env.DB_HOST_LOCAL}:${process.env.DB_PORT_LOCAL}/${process.env.DB_NAME_LOCAL}`;
// Inyectamos la URL antes de que Prisma la lea
process.env.DATABASE_URL = DATABASE_URL;
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;
//# sourceMappingURL=database.js.map