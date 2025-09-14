#!/usr/bin/env node

/**
 * Unified Database Management CLI
 * Combines migration, backup, seeding, and monitoring tools
 */

import { runMigrations } from './migrate.js';
import { createBackup, restoreBackup, listBackups } from './backup.js';
import { seedDatabase, clearDatabase } from './seed.js';
import { 
  analyzeTableSizes, 
  analyzeIndexUsage, 
  analyzeSlowQueries, 
  analyzeConnections, 
  suggestOptimizations 
} from './monitor.js';

function showHelp() {
  console.log('🗄️  Database Manager - Unified CLI Tool');
  console.log('');
  console.log('📋 MIGRATIONS:');
  console.log('  db-manager migrate                    - Run pending migrations');
  console.log('');
  console.log('💾 BACKUP & RESTORE:');
  console.log('  db-manager backup [name]              - Create database backup');
  console.log('  db-manager restore <name>             - Restore from backup');
  console.log('  db-manager list-backups               - List available backups');
  console.log('');
  console.log('🌱 SEEDING:');
  console.log('  db-manager seed [env]                 - Seed database (dev|staging|prod)');
  console.log('  db-manager clear                      - Clear all data');
  console.log('  db-manager reset [env]                - Clear and reseed');
  console.log('');
  console.log('📊 MONITORING:');
  console.log('  db-manager analyze                    - Complete performance analysis');
  console.log('  db-manager tables                     - Analyze table sizes');
  console.log('  db-manager indexes                    - Analyze index usage');
  console.log('  db-manager queries                    - Analyze query performance');
  console.log('  db-manager connections                - Analyze connections');
  console.log('  db-manager optimize                   - Get optimization suggestions');
  console.log('');
  console.log('🚀 QUICK ACTIONS:');
  console.log('  db-manager setup                      - Full setup (migrate + seed dev)');
  console.log('  db-manager health                     - Quick health check');
  console.log('');
  console.log('Examples:');
  console.log('  db-manager setup                      # Complete initial setup');
  console.log('  db-manager backup prod-v1.0           # Create named backup');
  console.log('  db-manager seed staging               # Seed staging data');
  console.log('  db-manager analyze                    # Full performance analysis');
}

async function quickSetup() {
  try {
    console.log('🚀 Setting up database...\n');
    
    console.log('1. Running migrations...');
    await runMigrations();
    
    console.log('\n2. Seeding development data...');
    await seedDatabase('dev');
    
    console.log('\n✅ Database setup complete!');
    console.log('Your timetable management system is ready to use.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function healthCheck() {
  try {
    console.log('🏥 Database Health Check\n');
    
    await analyzeTableSizes();
    await analyzeConnections();
    await suggestOptimizations();
    
    console.log('\n✅ Health check complete!');
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

async function fullAnalysis() {
  try {
    console.log('📊 Complete Database Analysis\n');
    
    await analyzeTableSizes();
    await analyzeIndexUsage();
    await analyzeSlowQueries();
    await analyzeConnections();
    await suggestOptimizations();
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv[4];
  
  try {
    switch (command) {
      // Migrations
      case 'migrate':
        await runMigrations();
        break;
        
      // Backup & Restore
      case 'backup':
        await createBackup(arg1);
        break;
        
      case 'restore':
        if (!arg1) {
          console.error('Please specify backup name to restore');
          process.exit(1);
        }
        await restoreBackup(arg1);
        break;
        
      case 'list-backups':
        const backups = await listBackups();
        console.log('\n📦 Available Backups:');
        if (backups.length === 0) {
          console.log('No backups found');
        } else {
          backups.forEach(backup => {
            const date = new Date(backup.timestamp).toLocaleString();
            const size = (backup.size / 1024).toFixed(1);
            console.log(`  📄 ${backup.name} - ${date} (${size}KB)`);
          });
        }
        break;
        
      // Seeding
      case 'seed':
        await seedDatabase(arg1 || 'dev');
        break;
        
      case 'clear':
        await clearDatabase();
        break;
        
      case 'reset':
        await clearDatabase();
        await seedDatabase(arg1 || 'dev');
        break;
        
      // Monitoring
      case 'analyze':
        await fullAnalysis();
        break;
        
      case 'tables':
        await analyzeTableSizes();
        break;
        
      case 'indexes':
        await analyzeIndexUsage();
        break;
        
      case 'queries':
        await analyzeSlowQueries();
        break;
        
      case 'connections':
        await analyzeConnections();
        break;
        
      case 'optimize':
        await suggestOptimizations();
        break;
        
      // Quick Actions
      case 'setup':
        await quickSetup();
        break;
        
      case 'health':
        await healthCheck();
        break;
        
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  quickSetup,
  healthCheck,
  fullAnalysis
};