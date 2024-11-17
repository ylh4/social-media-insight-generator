import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db;

export async function setupDatabase() {
  try {
    db = new Database(process.env.DATABASE_URL || join(__dirname, '../data/social_media.db'));
    
    // Enable WAL mode for better concurrent access
    db.pragma('journal_mode = WAL');
    
    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS social_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        network TEXT NOT NULL,
        message_url TEXT UNIQUE NOT NULL,
        date TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        content_type TEXT NOT NULL,
        profile TEXT NOT NULL,
        followers INTEGER NOT NULL,
        engagements INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    logger.info('Database setup completed');
  } catch (error) {
    logger.error('Database setup failed:', error);
    throw error;
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}