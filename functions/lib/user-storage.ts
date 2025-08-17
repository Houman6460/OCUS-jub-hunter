export class UserStorage {
  constructor(private db: any) {}

  async initializeUsers(): Promise<void> {
    try {
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'customer',
          created_at TEXT DEFAULT (datetime('now'))
        )
      `).run();
    } catch (error) {
      console.error('Failed to initialize users table:', error);
    }
  }

  async createUser(email: string, password: string, name: string): Promise<any> {
    try {
      const result = await this.db.prepare(`
        INSERT INTO users (email, password, name, role)
        VALUES (?, ?, ?, 'customer')
      `).bind(email, password, name).run();

      return {
        id: result.meta.last_row_id,
        email,
        name,
        role: 'customer'
      };
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<any | null> {
    try {
      const result = await this.db.prepare(`
        SELECT id, email, password, name, role, created_at
        FROM users
        WHERE email = ?
      `).bind(email).first();

      return result || null;
    } catch (error) {
      console.error('Failed to get user by email:', error);
      return null;
    }
  }

  async validateUser(email: string, password: string): Promise<any | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (user && user.password === password) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to validate user:', error);
      return null;
    }
  }

  async getAllCustomers(): Promise<any[]> {
    try {
      const result = await this.db.prepare(`
        SELECT id, email, name, role, created_at
        FROM users
        WHERE role = 'customer'
        ORDER BY created_at DESC
      `).all();

      return result.results || [];
    } catch (error) {
      console.error('Failed to get all customers:', error);
      return [];
    }
  }

  async getUserById(id: number): Promise<any | null> {
    try {
      const result = await this.db.prepare(`
        SELECT id, email, name, role, created_at
        FROM users
        WHERE id = ?
      `).bind(id).first();

      return result || null;
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      return null;
    }
  }
}
