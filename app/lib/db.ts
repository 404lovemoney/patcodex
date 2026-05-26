import { Pool } from "pg";

export const runtime = "nodejs";

type NetlifyDatabaseModule = {
  getConnectionString: () => string | Promise<string>;
};

let pool: Pool | undefined;

async function getNetlifyDatabaseConnectionString() {
  const dynamicImport = new Function("specifier", "return import(specifier)") as (
    specifier: string,
  ) => Promise<NetlifyDatabaseModule>;
  const { getConnectionString } = await dynamicImport("@netlify/database");

  return getConnectionString();
}

async function getConnectionString() {
  if (process.env.NETLIFY === "true") {
    const connectionString = await getNetlifyDatabaseConnectionString();

    if (!connectionString) {
      throw new Error("Netlify Database connection string is not configured");
    }

    return connectionString;
  }

  const connectionString = process.env.SESSION_DATABASE_URL;

  if (!connectionString) {
    throw new Error("SESSION_DATABASE_URL is not configured");
  }

  return connectionString;
}

export async function getPool() {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: await getConnectionString(),
    max: 5,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  return pool;
}
