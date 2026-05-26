import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";

const { Pool } = pg;

const envFiles = [".env.local", ".env"];

function loadEnvFile(filePath) {
  let contents;

  try {
    contents = readFileSync(filePath, "utf8");
  } catch {
    return;
  }

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;

    if (process.env[key]) {
      continue;
    }

    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }
}

for (const envFile of envFiles) {
  loadEnvFile(resolve(process.cwd(), envFile));
}

async function getTargetConnectionString() {
  const explicitConnectionString =
    process.env.NETLIFY_DB_URL || process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

  if (explicitConnectionString) {
    return explicitConnectionString;
  }

  const { getConnectionString } = await import("@netlify/database");

  return getConnectionString();
}

function createPool(connectionString) {
  return new Pool({
    connectionString,
    max: 3,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

function requireEnv(value, name) {
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

const sourceConnectionString = requireEnv(process.env.SESSION_DATABASE_URL, "SESSION_DATABASE_URL");
const targetConnectionString = requireEnv(await getTargetConnectionString(), "Netlify Database URL");

if (sourceConnectionString === targetConnectionString) {
  throw new Error("Source and target database URLs are identical; refusing to migrate.");
}

const source = createPool(sourceConnectionString);
const target = createPool(targetConnectionString);

try {
  const { rows } = await source.query(`
    select
      id,
      customer_name,
      phone,
      email,
      pet_type,
      appointment_date,
      appointment_time,
      service_type,
      notes,
      form_payload,
      status,
      created_at,
      updated_at
    from public.appointment_bookings
    order by created_at asc
  `);

  let inserted = 0;

  for (const row of rows) {
    const result = await target.query(
      `insert into public.appointment_bookings (
        id,
        customer_name,
        phone,
        email,
        pet_type,
        appointment_date,
        appointment_time,
        service_type,
        notes,
        form_payload,
        status,
        created_at,
        updated_at
      ) values ($1, $2, $3, $4, $5, $6::date, $7::time, $8, $9, $10::jsonb, $11, $12, $13)
      on conflict (id) do nothing`,
      [
        row.id,
        row.customer_name,
        row.phone,
        row.email,
        row.pet_type,
        row.appointment_date,
        row.appointment_time,
        row.service_type,
        row.notes,
        JSON.stringify(row.form_payload ?? {}),
        row.status,
        row.created_at,
        row.updated_at,
      ],
    );

    inserted += result.rowCount ?? 0;
  }

  const [{ rows: sourceCount }, { rows: targetCount }] = await Promise.all([
    source.query("select count(*)::int as count from public.appointment_bookings"),
    target.query("select count(*)::int as count from public.appointment_bookings"),
  ]);

  console.log(`Read ${rows.length} booking(s) from source.`);
  console.log(`Inserted ${inserted} new booking(s) into Netlify Database.`);
  console.log(`Source count: ${sourceCount[0].count}`);
  console.log(`Target count: ${targetCount[0].count}`);
} finally {
  await Promise.all([source.end(), target.end()]);
}
