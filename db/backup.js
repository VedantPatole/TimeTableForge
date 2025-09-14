#!/usr/bin/env node

/**
 * Database Backup and Restore Utility
 * Handles database backups and restoration for different environments
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const BACKUP_DIR = path.join(__dirname, 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function createBackup(name = null) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = name || `backup_${timestamp}`;
    const backupFile = path.join(BACKUP_DIR, `${backupName}.sql`);
    
    console.log(`Creating backup: ${backupName}`);
    
    // Parse DATABASE_URL to get connection details
    const url = new URL(process.env.DATABASE_URL);
    const host = url.hostname;
    const port = url.port || 5432;
    const database = url.pathname.slice(1);
    const username = url.username;
    const password = url.password;
    
    // Set PGPASSWORD environment variable for pg_dump
    process.env.PGPASSWORD = password;
    
    // Run pg_dump to create backup
    const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --clean --if-exists --no-owner --no-privileges > "${backupFile}"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✓ Backup created successfully: ${backupFile}`);
    
    // Create backup metadata
    const metadata = {
      name: backupName,
      file: backupFile,
      timestamp: new Date().toISOString(),
      database: database,
      size: fs.statSync(backupFile).size
    };
    
    const metadataFile = path.join(BACKUP_DIR, `${backupName}.json`);
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
    
    return metadata;
    
  } catch (error) {
    console.error('✗ Backup failed:', error.message);
    throw error;
  }
}

async function restoreBackup(backupName) {
  try {
    const backupFile = path.join(BACKUP_DIR, `${backupName}.sql`);
    const metadataFile = path.join(BACKUP_DIR, `${backupName}.json`);
    
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }
    
    console.log(`Restoring backup: ${backupName}`);
    console.log('⚠️  Warning: This will overwrite the current database!');
    
    // Parse DATABASE_URL to get connection details
    const url = new URL(process.env.DATABASE_URL);
    const host = url.hostname;
    const port = url.port || 5432;
    const database = url.pathname.slice(1);
    const username = url.username;
    const password = url.password;
    
    // Set PGPASSWORD environment variable for psql
    process.env.PGPASSWORD = password;
    
    // Run psql to restore backup
    const command = `psql -h ${host} -p ${port} -U ${username} -d ${database} -f "${backupFile}"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✓ Backup restored successfully: ${backupName}`);
    
    // Load and return metadata if available
    if (fs.existsSync(metadataFile)) {
      const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
      return metadata;
    }
    
    return { name: backupName, file: backupFile };
    
  } catch (error) {
    console.error('✗ Restore failed:', error.message);
    throw error;
  }
}

async function listBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter(file => file.endsWith('.sql'));
    
    const backups = backupFiles.map(file => {
      const name = file.replace('.sql', '');
      const backupFile = path.join(BACKUP_DIR, file);
      const metadataFile = path.join(BACKUP_DIR, `${name}.json`);
      
      let metadata = {
        name,
        file: backupFile,
        timestamp: fs.statSync(backupFile).mtime.toISOString(),
        size: fs.statSync(backupFile).size
      };
      
      if (fs.existsSync(metadataFile)) {
        const storedMetadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
        metadata = { ...metadata, ...storedMetadata };
      }
      
      return metadata;
    });
    
    // Sort by timestamp (newest first)
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return backups;
    
  } catch (error) {
    console.error('✗ Failed to list backups:', error.message);
    throw error;
  }
}

// CLI interface
const command = process.argv[2];
const argument = process.argv[3];

async function main() {
  try {
    switch (command) {
      case 'create':
        await createBackup(argument);
        break;
        
      case 'restore':
        if (!argument) {
          console.error('Please specify backup name to restore');
          process.exit(1);
        }
        await restoreBackup(argument);
        break;
        
      case 'list':
        const backups = await listBackups();
        console.log('\nAvailable backups:');
        if (backups.length === 0) {
          console.log('No backups found');
        } else {
          backups.forEach(backup => {
            const date = new Date(backup.timestamp).toLocaleString();
            const size = (backup.size / 1024).toFixed(1);
            console.log(`  ${backup.name} - ${date} (${size}KB)`);
          });
        }
        break;
        
      default:
        console.log('Database Backup & Restore Utility');
        console.log('');
        console.log('Usage:');
        console.log('  node backup.js create [name]     - Create a new backup');
        console.log('  node backup.js restore <name>    - Restore from backup');
        console.log('  node backup.js list              - List available backups');
        console.log('');
        console.log('Examples:');
        console.log('  node backup.js create             # Auto-generated name');
        console.log('  node backup.js create prod-v1.0   # Custom name');
        console.log('  node backup.js restore prod-v1.0  # Restore backup');
        break;
    }
  } catch (error) {
    console.error('Operation failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createBackup, restoreBackup, listBackups };