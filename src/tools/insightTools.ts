import { dbAll, dbExec, dbRun } from '../db/index.js';
import { PlotlyChartConfig } from '../types/index.js';
import { formatSuccessResponse, formatSuccessResponseHTML } from '../utils/formatUtils.js';
import { aggregateData } from '../utils/helper.js';

/**
 * Add a business insight to the memo
 * @param insight Business insight text
 * @returns Result of the operation
 */
export async function appendInsight(insight: string) {
  try {
    if (!insight) {
      throw new Error("Insight text is required");
    }

    // Create insights table if it doesn't exist
    await dbExec(`
      CREATE TABLE IF NOT EXISTS mcp_insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        insight TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert the insight
    await dbRun(
      "INSERT INTO mcp_insights (insight) VALUES (?)",
      [insight]
    );
    
    return formatSuccessResponse({ success: true, message: "Insight added" });
  } catch (error: any) {
    throw new Error(`Error adding insight: ${error.message}`);
  }
}

/**
 * List all insights in the memo
 * @returns Array of insights
 */
export async function listInsights() {
  try {
    // Check if insights table exists
    const tableExists = await dbAll(
      "SELECT name FROM sqlite_master WHERE type='table' AND name = 'mcp_insights'"
    );
    
    if (tableExists.length === 0) {
      // Create table if it doesn't exist
      await dbExec(`
        CREATE TABLE IF NOT EXISTS mcp_insights (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          insight TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      return formatSuccessResponse([]);
    }
    
    const insights = await dbAll("SELECT * FROM mcp_insights ORDER BY created_at DESC");
    return formatSuccessResponse(insights);
  } catch (error: any) {
    throw new Error(`Error listing insights: ${error.message}`);
  }
} 

export async function generatePlotlyChart(config: PlotlyChartConfig): Promise<any> {
  const {
    data,
    chartType,
    xColumn,
    yColumn,
    valueColumn,
    labelColumn,
    title,
    colorColumn,
    aggregation = 'none',
    width = 800,
    height = 600
  } = config;

  if (!data || data.length === 0) {
    throw new Error('No data provided for chart generation');
  }

  let processedData = [...data];

  if (aggregation && aggregation !== 'none' && xColumn) {
    const targetColumn = yColumn || valueColumn;
    if (targetColumn) {
      processedData = aggregateData(data, xColumn, targetColumn, aggregation, colorColumn);
    }
  }

  const layout: any = {
    title: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
    width,
    height
  };

  let chartData: any[] = [];

  try {
    switch (chartType) {
      case 'bar':
        chartData = [{
          type: 'bar',
          x: processedData.map(row => row[xColumn!]),
          y: processedData.map(row => row[yColumn!]),
          marker: colorColumn ? { color: processedData.map(row => row[colorColumn]) } : undefined
        }];
        layout.xaxis = { title: xColumn };
        layout.yaxis = { title: yColumn };
        break;

      case 'line':
        chartData = [{
          type: 'scatter',
          mode: 'lines+markers',
          x: processedData.map(row => row[xColumn!]),
          y: processedData.map(row => row[yColumn!]),
          line: colorColumn ? { color: processedData.map(row => row[colorColumn]) } : undefined
        }];
        layout.xaxis = { title: xColumn };
        layout.yaxis = { title: yColumn };
        break;

      case 'pie':
        chartData = [{
          type: 'pie',
          labels: processedData.map(row => row[labelColumn!]),
          values: processedData.map(row => row[valueColumn!])
        }];
        break;

      case 'scatter':
        chartData = [{
          type: 'scatter',
          mode: 'markers',
          x: processedData.map(row => row[xColumn!]),
          y: processedData.map(row => row[yColumn!]),
          marker: colorColumn ? { color: processedData.map(row => row[colorColumn]), colorscale: 'Viridis' } : undefined
        }];
        layout.xaxis = { title: xColumn };
        layout.yaxis = { title: yColumn };
        break;

      case 'histogram':
        chartData = [{
          type: 'histogram',
          x: processedData.map(row => row[xColumn!]).filter(Boolean)
        }];
        layout.xaxis = { title: xColumn };
        layout.yaxis = { title: 'Frequency' };
        break;

      case 'box':
        chartData = [{
          type: 'box',
          y: processedData.map(row => row[xColumn!]).filter(Boolean),
          name: xColumn
        }];
        layout.yaxis = { title: xColumn };
        break;

      case 'heatmap':
        if (!xColumn || !yColumn || !valueColumn) {
          throw new Error('Heatmap requires xColumn, yColumn, and valueColumn');
        }

        const xValues = [...new Set(processedData.map(row => row[xColumn]))];
        const yValues = [...new Set(processedData.map(row => row[yColumn]))];

        const matrix = yValues.map(y =>
          xValues.map(x => {
            const match = processedData.find(row => row[xColumn] === x && row[yColumn] === y);
            return match ? match[valueColumn] : 0;
          })
        );

        chartData = [{
          type: 'heatmap',
          x: xValues,
          y: yValues,
          z: matrix,
          colorscale: 'Viridis'
        }];
        layout.xaxis = { title: xColumn };
        layout.yaxis = { title: yColumn };
        break;

      default:
        throw new Error(`Unsupported chart type: ${chartType}`);
    }

    // Return as full HTML string
    return formatSuccessResponseHTML(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
      </head>
      <body>
        <div id="chart" style="width:${width}px;height:${height}px;"></div>
        <script>
          Plotly.newPlot('chart', ${JSON.stringify(chartData)}, ${JSON.stringify(layout)});
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    throw new Error(`Failed to generate ${chartType} chart: ${error}`);
  }
}
