import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// Dev-safe database initialization - only throws when actually accessed
let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    // Use HTTP connection instead of WebSocket to avoid connection issues
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
    console.log('Database connection initialized successfully');
  } catch (error) {
    console.error('Error initializing database connection:', error);
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