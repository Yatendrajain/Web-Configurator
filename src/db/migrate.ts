import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

export const runMigrations = async () => {
  const connectionString = process.env.DATABASE_URL;
  console.log("🚨 Running migrations!");
  console.log("⏳ Waiting 3 seconds before proceeding...");
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const pool = new Pool({
    connectionString,
    max: 1,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 20000,
  });

  const db = drizzle(pool);

  try {
    console.log("⏳ Running migrations...");
    const start = Date.now();

    await migrate(db, {
      migrationsFolder: "./drizzle",
      migrationsTable: "__drizzle_migrations", // explicit table name
    });

    const end = Date.now();
    console.log(`✅ Migrations completed in ${end - start}ms`);

    // Verify migration status - only after successful migration
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count FROM drizzle.__drizzle_migrations
      `);
      console.log(`📊 Total migrations applied: ${result.rows[0].count}`);
    } catch (countError) {
      // This might happen on first run - that's okay
      console.log("📊 Migration count check skipped. Error:", countError);
    }
  } catch (error) {
    console.error("❌ Migration failed:");
    console.error(error);
    throw error;
  } finally {
    await pool.end();
  }
};

// runMigrations().catch((err) => {
//   console.error("❌ Migration script failed");
//   console.error("Error: ", err);
//   process.exit(1);
// });
