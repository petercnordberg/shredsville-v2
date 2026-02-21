import postgres from "postgres";

export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL not set, skipping migrations");
    return;
  }

  const sql = postgres(connectionString);

  try {
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

    await sql`
      CREATE TABLE IF NOT EXISTS preset_foods (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        calories REAL NOT NULL,
        protein REAL NOT NULL,
        fiber REAL NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        daily_calorie_target INTEGER NOT NULL DEFAULT 2000,
        daily_protein_target INTEGER NOT NULL DEFAULT 150,
        daily_fiber_target INTEGER NOT NULL DEFAULT 30
      )
    `;

    console.log("Database migrations complete");
  } catch (error) {
    console.error("Migration failed (will retry on next request):", error);
  } finally {
    await sql.end();
  }
}
