import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

const getClient = () => {
  // Gunakan DIRECT_URL (port 5432) untuk runtime karena pooler (6543) tidak stabil
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL atau DIRECT_URL environment variable tidak diset.");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

export const db = globalThis.prisma || getClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;