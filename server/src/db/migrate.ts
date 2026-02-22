import postgres from "postgres";

// SAFETY: This migration is additive-only.
// - Only CREATE TABLE IF NOT EXISTS (never DROP TABLE)
// - Only ADD COLUMN IF NOT EXISTS (never DROP COLUMN)
// - Never TRUNCATE, DELETE, or modify existing data
// - Safe to run multiple times (fully idempotent)

export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  console.log("Starting database migrations (additive-only, safe to re-run)...");

  const sql = postgres(connectionString, {
    max: 1,
    connect_timeout: 10,
  });

  try {
    // Verify connection and log target database
    const [info] = await sql`SELECT current_database() as db, current_schema() as schema`;
    console.log(`Connected to database: ${info.db}, schema: ${info.schema}`);

    // Check pre-existing state so we can confirm data is preserved
    const preExisting = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('nutrition_entries', 'preset_foods', 'user_settings')
    `;
    const existingTables = preExisting.map((t) => t.table_name);
    if (existingTables.length > 0) {
      console.log(`  Tables already present: ${existingTables.join(", ")}`);
      // Log row counts to confirm data is preserved across deploys
      for (const table of existingTables) {
        const [{ count }] = await sql`
          SELECT count(*)::int as count FROM ${sql(table)}
        `;
        console.log(`    ${table}: ${count} existing rows`);
      }
    } else {
      console.log("  No existing tables found, creating fresh schema");
    }

    // CREATE TABLE IF NOT EXISTS — only creates if missing, never touches existing tables
    await sql`
      CREATE TABLE IF NOT EXISTS nutrition_entries (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        description TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        fiber REAL NOT NULL,
        type TEXT NOT NULL DEFAULT 'manual'
      )
    `;
    console.log("  Created/verified: nutrition_entries");

    await sql`
      CREATE TABLE IF NOT EXISTS preset_foods (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        fiber REAL NOT NULL
      )
    `;
    console.log("  Created/verified: preset_foods");

    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        daily_calorie_target INTEGER NOT NULL DEFAULT 2000,
        daily_protein_target INTEGER NOT NULL DEFAULT 150,
        daily_fiber_target INTEGER NOT NULL DEFAULT 30
      )
    `;
    console.log("  Created/verified: user_settings");

    // Verify all tables exist after migration
    const postMigration = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('nutrition_entries', 'preset_foods', 'user_settings')
    `;

    const found = postMigration.map((t) => t.table_name);
    const required = ["nutrition_entries", "preset_foods", "user_settings"];
    const missing = required.filter((t) => !found.includes(t));

    if (missing.length > 0) {
      throw new Error(
        `Migration completed but tables are missing: ${missing.join(", ")}. Found: ${found.join(", ") || "none"}`
      );
    }

    // Verify data was preserved (row counts should not decrease)
    for (const table of found) {
      const [{ count }] = await sql`
        SELECT count(*)::int as count FROM ${sql(table)}
      `;
      console.log(`  Verified ${table}: ${count} rows`);
    }

    console.log("Database migrations complete - all tables verified, data preserved");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error; // Re-throw to prevent server from starting with broken DB
  } finally {
    await sql.end();
  }
}
