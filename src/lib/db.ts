import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DEFAULT_TURSO_URL = 'libsql://clear-flo-abhinav02.aws-ap-south-1.turso.io';
const DEFAULT_TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTA5MDk5NzYsImlkIjoiMDFhMGZhOGQtMTkwMS03MzI2LTgxMTEtZDMyMjZlNDdlMjZiIiwia2lkIjoiY2RHN3VHbE5YbU1QOUlLc0wxWkItRUhqM0k3Q3hkd04xNDVxRHJiT0NwSSIsInJpZCI6Ijk4ZTA0OThmLWU4Y2MtNGJmNy05YTJlLTQzYmY3Y2U2N2JkNSJ9.gI4Gnq8Ih5rQtX9lf-lOVPbsEBTqhurResNGQtEqXhBcrFtLkqs7Kd8Lc5Aj8u0h1VLIXDlZbJrLPYkw32KDDw';

function createPrismaClient() {
  const tursoUrl =
    process.env.TURSO_DATABASE_URL ||
    (process.env.DATABASE_URL?.startsWith('libsql://') || process.env.DATABASE_URL?.startsWith('https://')
      ? process.env.DATABASE_URL
      : DEFAULT_TURSO_URL);
  const tursoToken = process.env.TURSO_AUTH_TOKEN || DEFAULT_TURSO_TOKEN;

  if (tursoUrl) {
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({
      adapter,
      log: ['error', 'warn'],
    });
  }

  return new PrismaClient({
    log: ['error', 'warn'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


