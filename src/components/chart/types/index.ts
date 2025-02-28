
export type ChartType = "line" | "bar" | "doughnut" | "pie";


export interface CustomChartProps {
  type: ChartType; 
  data: any;       
  options?: any;   
}
