import { formatSuccessResponse } from '../utils/formatUtils.js';
import { getInsightsDb } from './insightsDb.js';

/**
 * Add a business insight to the memo for a specific database
 * @param dbId Database identifier
 * @param insight The insight to add
 * @returns Result of the operation
 */
export async function appendInsight(dbId: string, insight: string) {
  try {
    const db = getInsightsDb();
    await db.run(
      'INSERT INTO mcp_insights (db_id, insight) VALUES (?, ?)',
      [dbId, insight]
    );
    return formatSuccessResponse({ dbId, insight, message: 'Insight appended' });
  } catch (error: any) {
    throw new Error(`Error appending insight: ${error.message}`);
  }
}

/**
 * List all business insights in the memo for a specific database
 * @param dbId Database identifier
 * @returns List of insights
 */
export async function listInsights(dbId: string) {
  try {
    const db = getInsightsDb();
    const insights = await db.all(
      'SELECT id, insight, created_at FROM mcp_insights WHERE db_id = ? ORDER BY created_at DESC',
      [dbId]
    );
    return formatSuccessResponse({ dbId, insights });
  } catch (error: any) {
    throw new Error(`Error listing insights: ${error.message}`);
  }
} 