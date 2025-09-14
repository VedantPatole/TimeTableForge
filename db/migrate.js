#!/usr/bin/env node

/**
 * Database Migration Runner
 * Applies migration scripts in order and tracks applied migrations
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}

async function getAppliedMigrations() {
  const result = await pool.query('SELECT version FROM schema_migrations ORDER BY version');
  return result.rows.map(row => row.version);
}

async function applyMigration(migrationFile) {
  console.log(`Applying migration: ${migrationFile}`);
  
  const migrationPath = path.join(__dirname, 'migrations', migrationFile);
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  try {
    await pool.query('BEGIN');
    await pool.query(migrationSQL);
    await pool.query('COMMIT');
    console.log(`✓ Migration ${migrationFile} applied successfully`);
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(`✗ Migration ${migrationFile} failed:`, error.message);
    throw error;
  }
}

async function runMigrations() {
  try {
    console.log('Starting database migrations...\n');
    
    // Ensure migrations table exists
    await createMigrationsTable();
    
    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Get already applied migrations
    const appliedMigrations = await getAppliedMigrations();
    
    // Apply pending migrations
    const pendingMigrations = migrationFiles.filter(file => {
      const version = file.replace('.sql', '');
      return !appliedMigrations.includes(version);
    });
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations to apply.');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(file => console.log(`  - ${file}`));
    console.log();
    
    for (const migrationFile of pendingMigrations) {
      await applyMigration(migrationFile);
    }
    
    console.log(`\n✓ All migrations completed successfully!`);
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };