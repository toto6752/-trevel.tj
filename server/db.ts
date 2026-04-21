import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening SQLite database:', err.message);
  } else {
    console.log('📦 Connected to SQLite database at', dbPath);
  }
});

// Helper to handle PostgreSQL styled queries ($1, $2) by converting to (?)
const convertQuery = (text: string) => {
  return text
    .replace(/\$\d+/g, '?')
    .replace(/ILIKE/gi, 'LIKE'); // SQLite uses LIKE case-insensitively for ASCII by default
};

export const query = async (text: string, params: any[] = []) => {
  const sqliteQuery = convertQuery(text);
  
  // Decide which sqlite method to use
  const isSelect = sqliteQuery.trim().toUpperCase().startsWith('SELECT');
  
  const processRows = (rows: any[]) => {
    if (!rows) return [];
    return rows.map(row => {
      const newRow = { ...row };
      if (newRow.images && typeof newRow.images === 'string') {
        try {
          newRow.images = JSON.parse(newRow.images);
        } catch (e) {
          // If not JSON, keep as is (could be legacy data)
        }
      }
      if (newRow.amenities && typeof newRow.amenities === 'string') {
        try {
          newRow.amenities = JSON.parse(newRow.amenities);
        } catch (e) {
          // If not JSON, keep as is
        }
      }
      return newRow;
    });
  };

  if (isSelect) {
    return new Promise<{ rows: any[] }>((resolve, reject) => {
      db.all(sqliteQuery, params, (err, rows) => {
        if (err) reject(err);
        else resolve({ rows: processRows(rows) });
      });
    });
  } else {
    return new Promise<{ rows: any[] }>((resolve, reject) => {
      const hasReturning = sqliteQuery.toUpperCase().includes('RETURNING');
      
      if (hasReturning) {
        db.all(sqliteQuery, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows: processRows(rows) });
        });
      } else {
        db.run(sqliteQuery, params, function(err) {
          if (err) reject(err);
          else resolve({ rows: [] });
        });
      }
    });
  }
};

export async function initDb() {
  try {
    // Users Table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'tourist',
        phone TEXT,
        whatsapp TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Properties Table
    await query(`
      CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        city TEXT NOT NULL,
        price REAL NOT NULL,
        type TEXT NOT NULL,
        image_url TEXT,
        rating REAL DEFAULT 0,
        owner_id INTEGER REFERENCES users(id),
        amenities TEXT, -- SQLite doesn't have native arrays, store as JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tours Table
    await query(`
      CREATE TABLE IF NOT EXISTS tours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        city TEXT NOT NULL,
        price REAL NOT NULL,
        duration TEXT,
        images TEXT, -- Store as JSON string
        contacts TEXT,
        owner_id INTEGER REFERENCES users(id),
        rating REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Reviews Table
    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
        tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Chat Messages Table
    await query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        property_id INTEGER REFERENCES properties(id),
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Favorites Table
    await query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, tour_id)
      );
    `);

    // Viewing History Table
    await query(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        tour_id INTEGER REFERENCES tours(id) ON DELETE CASCADE,
        viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ SQLite Database schema initialized successfully');
  } catch (err) {
    console.error('❌ SQLite Database init error:', err instanceof Error ? err.message : err);
  }
}

export default db;
