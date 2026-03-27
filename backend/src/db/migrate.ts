import 'dotenv/config';
import { Pool } from 'pg';
import { up as migration001 } from './migrations/001_create_scheduled_emails';

const migrations = [
  { name: '001_create_scheduled_emails', up: migration001 },
];

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Create migrations tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Run pending migrations
    for (const migration of migrations) {
      const result = await pool.query(
        'SELECT id FROM migrations WHERE name = $1',
        [migration.name],
      );

      if (result.rows.length === 0) {
        console.log(`Running migration: ${migration.name}`);
        await migration.up(pool);
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name],
        );
        console.log(`Completed: ${migration.name}`);
      } else {
        console.log(`Skipping (already run): ${migration.name}`);
      }
    }

    console.log('All migrations complete.');
  } finally {
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
