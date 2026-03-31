import { PrismaClient } from '@prisma/client';

// Krijojmë një variabël globale që nuk fshihet kur Next.js bën Hot Reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Nëse ekziston lidhja, e përdorim atë. Nëse jo, krijojmë një të re.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient();

// Ruajmë lidhjen në variablën globale vetëm në fazën e zhvillimit (Development)
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;