import { dbAll, getListTablesQuery, getDescribeTableQuery, getDatabaseMetadata } from '../db/index.js';

/**
 * Handle listing resources request for a specific database
 * @param dbId Database identifier
 * @returns List of available resources
 */
export async function handleListResources(dbId: string) {
  try {
    const dbInfo = getDatabaseMetadata(dbId);
    const dbType = dbInfo.type;
    let resourceBaseUrl: URL;
    
    // Create appropriate URL based on database type
    if (dbType === 'sqlite' && dbInfo.path) {
      resourceBaseUrl = new URL(`sqlite:///${dbInfo.path}`);
    } else if (dbType === 'sqlserver' && dbInfo.server && dbInfo.database) {
      resourceBaseUrl = new URL(`sqlserver://${dbInfo.server}/${dbInfo.database}`);
    } else {
      resourceBaseUrl = new URL(`db:///database`);
    }
    
    const SCHEMA_PATH = "schema";

    // Use adapter-specific query to list tables
    const query = getListTablesQuery(dbId);
    const result = await dbAll(dbId, query);
    
    return {
      resources: result.map((row: any) => ({
        uri: new URL(`${row.name}/${SCHEMA_PATH}`, resourceBaseUrl).href,
        mimeType: "application/json",
        name: `"${row.name}" database schema`,
      })),
    };
  } catch (error: any) {
    throw new Error(`Error listing resources: ${error.message}`);
  }
}

/**
 * Handle reading a specific resource for a specific database
 * @param dbId Database identifier
 * @param uri URI of the resource to read
 * @returns Resource contents
 */
export async function handleReadResource(dbId: string, uri: string) {
  try {
    const resourceUrl = new URL(uri);
    const SCHEMA_PATH = "schema";

    const pathComponents = resourceUrl.pathname.split("/");
    const schema = pathComponents.pop();
    const tableName = pathComponents.pop();

    if (schema !== SCHEMA_PATH) {
      throw new Error("Invalid resource URI");
    }

    // Use adapter-specific query to describe the table
    const query = getDescribeTableQuery(dbId, tableName!);
    const result = await dbAll(dbId, query);

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(result.map((column: any) => ({
            column_name: column.name,
            data_type: column.type
          })), null, 2),
        },
      ],
    };
  } catch (error: any) {
    throw new Error(`Error reading resource: ${error.message}`);
  }
} 