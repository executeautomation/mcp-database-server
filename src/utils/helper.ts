export function aggregateData(
  data: any[],
  groupBy: string,
  valueColumn?: string,
  aggregation?: string,
  colorColumn?: string
): any[] {
  const grouped = data.reduce((acc, row) => {
    const key = colorColumn ? `${row[groupBy]}_${row[colorColumn]}` : row[groupBy];
    if (!acc[key]) {
      acc[key] = {
        [groupBy]: row[groupBy],
        values: [],
        ...(colorColumn && { [colorColumn]: row[colorColumn] })
      };
    }
    acc[key].values.push(parseFloat(row[valueColumn || 0]) || 0);
    return acc;
  }, {} as any);

  return Object.values(grouped).map((group: any) => {
    let aggregatedValue: number;
    switch (aggregation) {
      case 'sum':
        aggregatedValue = group.values.reduce((sum: number, val: number) => sum + val, 0);
        break;
      case 'avg':
        aggregatedValue = group.values.reduce((sum: number, val: number) => sum + val, 0) / group.values.length;
        break;
      case 'count':
        aggregatedValue = group.values.length;
        break;
      case 'min':
        aggregatedValue = Math.min(...group.values);
        break;
      case 'max':
        aggregatedValue = Math.max(...group.values);
        break;
      default:
        aggregatedValue = group.values[0];
    }

    return {
      [groupBy]: group[groupBy],
      [valueColumn || 0]: aggregatedValue,
      ...(colorColumn && { [colorColumn]: group[colorColumn] })
    };
  });
}
