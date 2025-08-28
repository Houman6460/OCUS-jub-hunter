import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

export type DbInstance = BetterSQLite3Database<typeof schema>;

let dbInstance: DbInstance | null = null;

export async function initializeDb(): Promise<DbInstance> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set - database operations will fail.');
    throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
  }

  try {
    const sqlite = new Database(process.env.DATABASE_URL.replace('file:', ''));
    dbInstance = drizzle(sqlite, { schema });
    console.log('Database connection initialized successfully with SQLite');
    return dbInstance;
  } catch (error) {
    console.error('Error initializing SQLite database connection:', error);
    throw new Error("Failed to initialize database.");
  }
}