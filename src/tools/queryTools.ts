import { dbAll, dbRun, dbExec } from '../db/index.js';
import { formatErrorResponse, formatSuccessResponse, convertToCSV } from '../utils/formatUtils.js';
import { listDatabases as coreListDatabases } from '../db/index.js';

/**
 * Execute a read-only SQL query
 * @param dbId Database identifier
 * @param query SQL query to execute
 * @returns Query results
 */
export async function readQuery(dbId: string, query: string) {
  try {
    if (!query.trim().toLowerCase().startsWith("select")) {
      throw new Error("Only SELECT queries are allowed with read_query");
    }

    const result = await dbAll(dbId, query);
    return formatSuccessResponse(result);
  } catch (error: any) {
    throw new Error(`SQL Error: ${error.message}`);
  }
}

/**
 * Execute a data modification SQL query
 * @param dbId Database identifier
 * @param query SQL query to execute
 * @returns Information about affected rows
 */
export async function writeQuery(dbId: string, query: string) {
  try {
    const lowerQuery = query.trim().toLowerCase();
    
    if (lowerQuery.startsWith("select")) {
      throw new Error("Use read_query for SELECT operations");
    }
    
    if (!(lowerQuery.startsWith("insert") || lowerQuery.startsWith("update") || lowerQuery.startsWith("delete"))) {
      throw new Error("Only INSERT, UPDATE, or DELETE operations are allowed with write_query");
    }

    const result = await dbRun(dbId, query);
    return formatSuccessResponse({ affected_rows: result.changes });
  } catch (error: any) {
    throw new Error(`SQL Error: ${error.message}`);
  }
}

/**
 * Export query results to CSV or JSON format
 * @param dbId Database identifier
 * @param query SQL query to execute
 * @param format Output format (csv or json)
 * @returns Formatted query results
 */
export async function exportQuery(dbId: string, query: string, format: string) {
  try {
    if (!query.trim().toLowerCase().startsWith("select")) {
      throw new Error("Only SELECT queries are allowed with export_query");
    }

    const result = await dbAll(dbId, query);
    
    if (format === "csv") {
      const csvData = convertToCSV(result);
      return {
        content: [{ 
          type: "text", 
          text: csvData
        }],
        isError: false,
      };
    } else if (format === "json") {
      return formatSuccessResponse(result);
    } else {
      throw new Error("Unsupported export format. Use 'csv' or 'json'");
    }
  } catch (error: any) {
    throw new Error(`Export Error: ${error.message}`);
  }
}

// List all available databases (tool version)
export async function listDatabasesTool() {
  const databases = coreListDatabases();
  return formatSuccessResponse({ databases });
} 