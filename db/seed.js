#!/usr/bin/env node

/**
 * Database Seeding Utility
 * Seeds database with environment-specific data
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase(environment = 'dev') {
  try {
    const seedFile = path.join(__dirname, 'seeds', `${environment}_seed.sql`);
    
    if (!fs.existsSync(seedFile)) {
      throw new Error(`Seed file not found: ${seedFile}`);
    }
    
    console.log(`Seeding database with ${environment} data...`);
    
    const seedSQL = fs.readFileSync(seedFile, 'utf8');
    
    await pool.query('BEGIN');
    await pool.query(seedSQL);
    await pool.query('COMMIT');
    
    console.log(`✓ Database seeded successfully with ${environment} data`);
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('✗ Seeding failed:', error.message);
    throw error;
  }
}

async function clearDatabase() {
  try {
    console.log('Clearing database...');
    
    const clearSQL = `
      DELETE FROM timetables;
      DELETE FROM subjects;
      DELETE FROM time_slots;
      DELETE FROM rooms;
      DELETE FROM faculty;
      DELETE FROM students;
      DELETE FROM divisions;
      DELETE FROM departments;
      DELETE FROM users;
    `;
    
    await pool.query('BEGIN');
    await pool.query(clearSQL);
    await pool.query('COMMIT');
    
    console.log('✓ Database cleared successfully');
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('✗ Clear failed:', error.message);
    throw error;
  }
}

// CLI interface
const command = process.argv[2];
const environment = process.argv[3] || 'dev';

async function main() {
  try {
    switch (command) {
      case 'seed':
        await seedDatabase(environment);
        break;
        
      case 'clear':
        await clearDatabase();
        break;
        
      case 'reset':
        await clearDatabase();
        await seedDatabase(environment);
        break;
        
      default:
        console.log('Database Seeding Utility');
        console.log('');
        console.log('Usage:');
        console.log('  node seed.js seed [env]    - Seed database (dev|staging|prod)');
        console.log('  node seed.js clear         - Clear all data');
        console.log('  node seed.js reset [env]   - Clear and reseed');
        console.log('');
        console.log('Examples:');
        console.log('  node seed.js seed dev      # Seed with development data');
        console.log('  node seed.js seed staging  # Seed with staging data');
        console.log('  node seed.js seed prod     # Seed with production data');
        console.log('  node seed.js reset dev     # Clear and reseed development');
        console.log('');
        console.log('Available environments: dev, staging, prod');
        break;
    }
  } catch (error) {
    console.error('Operation failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedDatabase, clearDatabase };