import postgres from "postgres";

export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  console.log("Starting database migrations...");

  const sql = postgres(connectionString, {
    max: 1,
    connect_timeout: 10,
  });

  try {
    // Verify connection and log target database
    const [info] = await sql`SELECT current_database() as db, current_schema() as schema`;
    console.log(`Connected to database: ${info.db}, schema: ${info.schema}`);

    // Create tables sequentially (IF NOT EXISTS makes these idempotent)
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

    // Verify tables actually exist by querying information_schema
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('nutrition_entries', 'preset_foods', 'user_settings')
    `;

    const found = tables.map((t) => t.table_name);
    const required = ["nutrition_entries", "preset_foods", "user_settings"];
    const missing = required.filter((t) => !found.includes(t));

    if (missing.length > 0) {
      throw new Error(
        `Migration completed but tables are missing: ${missing.join(", ")}. Found: ${found.join(", ") || "none"}`
      );
    }

    console.log(`Database migrations complete - verified ${found.length} tables`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error; // Re-throw to prevent server from starting with broken DB
  } finally {
    await sql.end();
  }
}
