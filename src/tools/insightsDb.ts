import { SqliteAdapter } from '../db/sqlite-adapter.js';

let insightsDb: SqliteAdapter | null = null;
let insightsDbPath: string = './insights.sqlite';

/**
 * Initialize the insights database (singleton)
 * @param path Path to SQLite file (or ':memory:' for ephemeral)
 */
export async function initInsightsDb(path?: string) {
  if (insightsDb) return; // Already initialized
  insightsDbPath = path || './insights.sqlite';
  insightsDb = new SqliteAdapter(insightsDbPath);
  await insightsDb.init();
  // Create the insights table if it doesn't exist
  await insightsDb.exec(`
    CREATE TABLE IF NOT EXISTS mcp_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      db_id TEXT,
      insight TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * Get the initialized insights database adapter
 */
export function getInsightsDb(): SqliteAdapter {
  if (!insightsDb) throw new Error('Insights database not initialized');
  return insightsDb;
}

/**
 * Close the insights database connection
 */
export async function closeInsightsDb() {
  if (insightsDb) {
    await insightsDb.close();
    insightsDb = null;
  }
} 