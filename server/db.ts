import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

// Dev-safe database initialization - only throws when actually accessed
let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    const sqlite = new Database(process.env.DATABASE_URL.replace('file:', ''));
    db = drizzle(sqlite, { schema });
    console.log('Database connection initialized successfully with SQLite');
  } catch (error) {
    console.error('Error initializing SQLite database connection:', error);
    // Don't throw here, allow the app to start but operations will fail gracefully
    db = null;
  }
} else {
  // Create proxy that throws only on actual database access
  console.warn('DATABASE_URL not set - database operations will fail until configured');
  
  db = new Proxy({} as any, {
    get() {
      throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
    }
  });
}

export { db };