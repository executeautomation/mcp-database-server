export interface PlotlyChartConfig {
  data: any[];
  chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'box' | 'heatmap';
  xColumn?: string;
  yColumn?: string;
  valueColumn?: string;
  labelColumn?: string;
  title?: string;
  colorColumn?: string;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';
  width?: number;
  height?: number;
}