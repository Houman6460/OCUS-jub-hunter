import type { D1Database } from '@cloudflare/workers-types';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  name: string;
  hashedPassword?: string;
}

export class UserStorage {
  constructor(private db: D1Database) {}

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
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
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
        INSERT INTO users (email, name)
        VALUES (?, ?)
      `).bind(email, name).run();

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

    async validateUser(email: string, password: string): Promise<Omit<User, 'hashedPassword'> | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (user) {
        const { hashedPassword, ...userWithoutPassword } = user;
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
