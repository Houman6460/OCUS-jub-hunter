import type { D1Database } from '@cloudflare/workers-types';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
}

export class UserStorage {
  constructor(private db: D1Database) {}

  async getAllCustomers(): Promise<any[]> {
    try {
      const customers = await this.db.prepare(`
        SELECT id, email, name, is_premium, extension_activated, total_spent, total_orders, created_at
        FROM customers 
        ORDER BY created_at DESC
      `).all();
      return customers.results || [];
    } catch (error) {
      console.error('Failed to get all customers:', error);
      return [];
    }
  }

  async initializeUsers(): Promise<void> {
    try {
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT, -- Nullable for social logins
          name TEXT NOT NULL,
          role TEXT DEFAULT 'customer' NOT NULL,
          provider TEXT,
          provider_id TEXT,
          is_premium BOOLEAN DEFAULT 0,
          extension_activated BOOLEAN DEFAULT 0,
          premium_activated_at TEXT,
          total_spent REAL DEFAULT 0,
          total_orders INTEGER DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `).run();
    } catch (error) {
      console.error('Failed to initialize users table:', error);
      throw new Error('Database initialization failed.');
    }
  }

    async createUser(email: string, password: string, name: string): Promise<User> {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();
    try {
      const result = await this.db.prepare(`
        INSERT INTO users (email, name, password, created_at, updatedAt)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
      `).bind(email, name, hashedPassword).run();

      const userId = result.meta.last_row_id;
      if (!userId) {
        throw new Error('Failed to get user ID after creation.');
      }

      const newUser = await this.getUserById(userId);
      if (!newUser) {
        throw new Error('Could not retrieve newly created user.');
      }
      return newUser;

    } catch (error) {
      console.error('Failed to create user:', error);
      throw error; // Re-throw to be handled by the caller
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.db.prepare(
        'SELECT * FROM users WHERE email = ?'
      ).bind(email).first<User>();
      return user || null;
    } catch (error) {
      console.error('Failed to get user by email:', error);
      return null;
    }
  }

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (user && user.password && bcrypt.compareSync(password, user.password)) {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      console.error('Failed to validate user:', error);
      return null;
    }
  }

  async getUserById(id: number): Promise<User | null> {
    try {
      const user = await this.db.prepare(
        'SELECT * FROM users WHERE id = ?'
      ).bind(id).first<User>();
      return user || null;
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      return null;
    }
  }
}
