#!/usr/bin/env node

/**
 * Database Performance Monitoring Tools
 * Provides query analysis, index usage, and performance metrics
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function analyzeTableSizes() {
  try {
    console.log('📊 Table Size Analysis');
    console.log('='.repeat(50));
    
    const query = `
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size,
        (SELECT reltuples::BIGINT FROM pg_class WHERE relname = tablename) AS row_count
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;
    
    const result = await pool.query(query);
    
    console.log('Table Name'.padEnd(20) + 'Rows'.padEnd(10) + 'Table Size'.padEnd(12) + 'Index Size'.padEnd(12) + 'Total Size');
    console.log('-'.repeat(70));
    
    result.rows.forEach(row => {
      console.log(
        row.tablename.padEnd(20) +
        (row.row_count || 0).toString().padEnd(10) +
        row.table_size.padEnd(12) +
        row.index_size.padEnd(12) +
        row.total_size
      );
    });
    
  } catch (error) {
    console.error('Error analyzing table sizes:', error.message);
  }
}

async function analyzeIndexUsage() {
  try {
    console.log('\n📈 Index Usage Analysis');
    console.log('='.repeat(50));
    
    const query = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        idx_scan,
        CASE 
          WHEN idx_scan = 0 THEN 'UNUSED'
          WHEN idx_scan < 100 THEN 'LOW USAGE'
          WHEN idx_scan < 1000 THEN 'MEDIUM USAGE'
          ELSE 'HIGH USAGE'
        END as usage_status
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC;
    `;
    
    const result = await pool.query(query);
    
    console.log('Table'.padEnd(15) + 'Index'.padEnd(25) + 'Scans'.padEnd(10) + 'Tuples Read'.padEnd(15) + 'Status');
    console.log('-'.repeat(80));
    
    result.rows.forEach(row => {
      console.log(
        row.tablename.padEnd(15) +
        row.indexname.padEnd(25) +
        row.idx_scan.toString().padEnd(10) +
        row.idx_tup_read.toString().padEnd(15) +
        row.usage_status
      );
    });
    
  } catch (error) {
    console.error('Error analyzing index usage:', error.message);
  }
}

async function analyzeSlowQueries() {
  try {
    console.log('\n🐌 Query Performance Analysis');
    console.log('='.repeat(50));
    
    // Enable pg_stat_statements if available
    const query = `
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        min_time,
        max_time,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements 
      WHERE query NOT LIKE '%pg_stat_statements%'
      ORDER BY total_time DESC 
      LIMIT 10;
    `;
    
    try {
      const result = await pool.query(query);
      
      if (result.rows.length === 0) {
        console.log('pg_stat_statements extension not available or no queries recorded.');
        console.log('To enable query tracking, run: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;');
      } else {
        console.log('Top 10 queries by total execution time:');
        console.log('-'.repeat(100));
        
        result.rows.forEach((row, index) => {
          console.log(`${index + 1}. Calls: ${row.calls}, Total: ${row.total_time}ms, Avg: ${row.mean_time}ms`);
          console.log(`   Hit%: ${row.hit_percent}%, Rows: ${row.rows}`);
          console.log(`   Query: ${row.query.substring(0, 80)}...`);
          console.log();
        });
      }
    } catch (extError) {
      console.log('pg_stat_statements extension not available.');
      console.log('Query performance tracking requires the pg_stat_statements extension.');
    }
    
  } catch (error) {
    console.error('Error analyzing query performance:', error.message);
  }
}

async function analyzeConnections() {
  try {
    console.log('\n🔌 Connection Analysis');
    console.log('='.repeat(50));
    
    const queries = [
      {
        name: 'Active Connections',
        query: `
          SELECT 
            state,
            COUNT(*) as count,
            AVG(EXTRACT(EPOCH FROM (now() - query_start))) as avg_duration_seconds
          FROM pg_stat_activity 
          WHERE pid <> pg_backend_pid()
          GROUP BY state
          ORDER BY count DESC;
        `
      },
      {
        name: 'Database Statistics',
        query: `
          SELECT 
            numbackends as active_connections,
            xact_commit as transactions_committed,
            xact_rollback as transactions_rolled_back,
            blks_read as blocks_read,
            blks_hit as blocks_hit,
            tup_returned as tuples_returned,
            tup_fetched as tuples_fetched,
            tup_inserted as tuples_inserted,
            tup_updated as tuples_updated,
            tup_deleted as tuples_deleted
          FROM pg_stat_database 
          WHERE datname = current_database();
        `
      }
    ];
    
    for (const { name, query } of queries) {
      console.log(`\n${name}:`);
      const result = await pool.query(query);
      console.table(result.rows);
    }
    
  } catch (error) {
    console.error('Error analyzing connections:', error.message);
  }
}

async function suggestOptimizations() {
  try {
    console.log('\n💡 Optimization Suggestions');
    console.log('='.repeat(50));
    
    const suggestions = [];
    
    // Check for missing indexes on foreign keys
    const fkQuery = `
      SELECT 
        t.table_name,
        t.column_name,
        'Missing index on foreign key: ' || t.table_name || '.' || t.column_name as suggestion
      FROM information_schema.key_column_usage t
      LEFT JOIN pg_stat_user_indexes i ON i.relname = t.table_name AND i.indexrelname LIKE '%' || t.column_name || '%'
      WHERE t.table_schema = 'public' 
      AND t.constraint_name LIKE '%_fkey'
      AND i.indexrelname IS NULL;
    `;
    
    const fkResult = await pool.query(fkQuery);
    suggestions.push(...fkResult.rows.map(row => row.suggestion));
    
    // Check for unused indexes
    const unusedIndexQuery = `
      SELECT 
        'Consider dropping unused index: ' || indexrelname as suggestion
      FROM pg_stat_user_indexes 
      WHERE idx_scan = 0 AND schemaname = 'public';
    `;
    
    const unusedResult = await pool.query(unusedIndexQuery);
    suggestions.push(...unusedResult.rows.map(row => row.suggestion));
    
    // Check for tables with high sequential scans
    const seqScanQuery = `
      SELECT 
        'Table ' || relname || ' has high sequential scans (' || seq_scan || '). Consider adding indexes.' as suggestion
      FROM pg_stat_user_tables 
      WHERE seq_scan > 1000 AND schemaname = 'public';
    `;
    
    const seqScanResult = await pool.query(seqScanQuery);
    suggestions.push(...seqScanResult.rows.map(row => row.suggestion));
    
    if (suggestions.length === 0) {
      console.log('✓ No immediate optimization suggestions found.');
    } else {
      suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
    }
    
  } catch (error) {
    console.error('Error generating optimization suggestions:', error.message);
  }
}

// CLI interface
const command = process.argv[2];

async function main() {
  try {
    switch (command) {
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
        
      case 'all':
        await analyzeTableSizes();
        await analyzeIndexUsage();
        await analyzeSlowQueries();
        await analyzeConnections();
        await suggestOptimizations();
        break;
        
      default:
        console.log('Database Performance Monitoring Tools');
        console.log('');
        console.log('Usage:');
        console.log('  node monitor.js tables       - Analyze table sizes and row counts');
        console.log('  node monitor.js indexes      - Analyze index usage statistics');
        console.log('  node monitor.js queries      - Analyze slow query performance');
        console.log('  node monitor.js connections  - Analyze database connections');
        console.log('  node monitor.js optimize     - Suggest optimizations');
        console.log('  node monitor.js all          - Run all analyses');
        console.log('');
        console.log('Examples:');
        console.log('  node monitor.js all           # Complete performance analysis');
        console.log('  node monitor.js tables        # Check table sizes');
        console.log('  node monitor.js optimize      # Get optimization suggestions');
        break;
    }
  } catch (error) {
    console.error('Monitoring failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  analyzeTableSizes, 
  analyzeIndexUsage, 
  analyzeSlowQueries, 
  analyzeConnections, 
  suggestOptimizations 
};