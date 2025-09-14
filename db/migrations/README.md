# Database Migrations

This directory contains database migration scripts for the timetable management system.

## Migration Scripts

- `001_initial_schema.sql` - Initial database schema with all tables
- `002_add_indexes.sql` - Performance indexes for frequently queried columns
- `003_add_constraints.sql` - Additional constraints for data integrity

## Usage

1. Run migrations in order by executing SQL files against your database
2. Track applied migrations in the `schema_migrations` table
3. Use version control to manage schema changes across environments

## Environment-specific Scripts

- `dev_seed.sql` - Development environment sample data
- `staging_seed.sql` - Staging environment test data  
- `prod_seed.sql` - Production environment initial data (minimal)