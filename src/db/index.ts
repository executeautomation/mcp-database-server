import { DbAdapter, createDbAdapter } from './adapter.js';

// Store the active database adapters by ID
const dbAdapters: Record<string, DbAdapter> = {};
const dbMetadatas: Record<string, { name: string, type: string, path?: string, server?: string, database?: string, description?: string }> = {};

/**
 * Initialize a database connection and register it by ID
 * @param dbId Unique database identifier
 * @param connectionInfo Connection information object or SQLite path string
 * @param dbType Database type ('sqlite', 'sqlserver', etc.)
 * @param description Optional description for the database
 */
export async function initDatabase(dbId: string, connectionInfo: any, dbType: string = 'sqlite', description?: string): Promise<void> {
  try {
    if (typeof connectionInfo === 'string') {
      connectionInfo = { path: connectionInfo };
    }
    const adapter = createDbAdapter(dbType, connectionInfo);
    await adapter.init();
    dbAdapters[dbId] = adapter;
    dbMetadatas[dbId] = { ...adapter.getMetadata(), description };
  } catch (error) {
    throw new Error(`Failed to initialize database '${dbId}': ${(error as Error).message}`);
  }
}

/**
 * Get all registered database IDs and their metadata
 */
export function listDatabases() {
  return Object.entries(dbMetadatas).map(([id, meta]) => ({ id, ...meta }));
}

/**
 * Execute a SQL query and get all results for a specific database
 */
export function dbAll(dbId: string, query: string, params: any[] = []): Promise<any[]> {
  const adapter = dbAdapters[dbId];
  if (!adapter) throw new Error(`Database '${dbId}' not initialized`);
  return adapter.all(query, params);
}

/**
 * Execute a SQL query that modifies data for a specific database
 */
export function dbRun(dbId: string, query: string, params: any[] = []): Promise<{ changes: number, lastID: number }> {
  const adapter = dbAdapters[dbId];
  if (!adapter) throw new Error(`Database '${dbId}' not initialized`);
  return adapter.run(query, params);
}

/**
 * Execute multiple SQL statements for a specific database
 */
export function dbExec(dbId: string, query: string): Promise<void> {
  const adapter = dbAdapters[dbId];
  if (!adapter) throw new Error(`Database '${dbId}' not initialized`);
  return adapter.exec(query);
}

/**
 * Close all database connections
 */
export async function closeAllDatabases(): Promise<void> {
  await Promise.all(Object.values(dbAdapters).map(adapter => adapter.close()));
}

/**
 * Get metadata for a specific database
 */
export function getDatabaseMetadata(dbId: string): { name: string, type: string, path?: string, server?: string, database?: string, description?: string } {
  const meta = dbMetadatas[dbId];
  if (!meta) throw new Error(`Database '${dbId}' not initialized`);
  return meta;
}

/**
 * Get database-specific query for listing tables for a specific database
 */
export function getListTablesQuery(dbId: string): string {
  const adapter = dbAdapters[dbId];
  if (!adapter) throw new Error(`Database '${dbId}' not initialized`);
  return adapter.getListTablesQuery();
}

/**
 * Get database-specific query for describing a table for a specific database
 */
export function getDescribeTableQuery(dbId: string, tableName: string): string {
  const adapter = dbAdapters[dbId];
  if (!adapter) throw new Error(`Database '${dbId}' not initialized`);
  return adapter.getDescribeTableQuery(tableName);
} 