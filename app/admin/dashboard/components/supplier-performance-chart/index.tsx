import { Users } from "lucide-react";
import {
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Line,
  ComposedChart,
} from "recharts";

interface SupplierData {
  supplier_name: string;
  total_purchase_orders: number;
  completed_purchase_orders: number;
  processing_purchase_orders: number;
  completion_rate: number;
}

interface SupplierPerformanceChartProps {
  data: SupplierData[];
  isLoading : boolean;
}

export function SupplierPerformanceChart({ data, isLoading }: SupplierPerformanceChartProps) {
    const formatLabel = (value: string) =>
  value.length > 12 ? `${value.slice(0, 13)}…` : value;
  return (
    <div className="rounded-xl w-full overflow-hidden bg-card shadow-sm border animate-slide-up" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center gap-2 border-b border-border p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50">
          <Users className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Supplier Performance</h3>
          <p className="text-sm text-muted-foreground">Orders, Sales & Success Rate</p>
        </div>
      </div>
      <div className="py-8">
           {isLoading ? (
                       
                            <div className="flex items-center justify-center w-full">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary mr-2" />
                              Loading...
                            </div>
                       
                      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}  barCategoryGap="40%" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                
              <XAxis
                dataKey="supplier_name"
                tickFormatter={formatLabel}
                axisLine={true}
                tickLine={false}
                className="text-muted-foreground"
                tick={{ fontSize: 10 }}
                textAnchor="end"
                height={50}
              />
              <YAxis
                yAxisId="left"
                axisLine={true}
                tickLine={false}
                className="text-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                 className="text-muted-foreground"
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px hsl(var(--foreground) / 0.1)",
                }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    total_purchase_orders: "Total Orders",
                    completed_purchase_orders: "Completed",
                    processing_purchase_orders: "Processing",
                    completion_rate: "Completion Rate",
                  };
                  if (name === "completion_rate") return [`${value}%`, labels[name]];
                  return [value, labels[name] || name];
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => {
                  const labels: Record<string, string> = {
                    total_purchase_orders: "Total Orders",
                    completed_purchase_orders: "Completed",
                    processing_purchase_orders: "Processing",
                    completion_rate: "Completion Rate",
                  };
                  return <span className="text-sm text-muted-foreground">{labels[value] || value}</span>;
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="total_purchase_orders"
                className="text-warning"
                fill="hsl(162 98% 41%)"
                radius={[4, 4, 0, 0]}
                 minPointSize={3}
                barSize={12}
              />
              <Bar
                yAxisId="left"
                dataKey="completed_purchase_orders"
                fill="hsl(162 63% 41%)"
                radius={[4, 4, 0, 0]}
                 minPointSize={3}
                barSize={12}
              />
              <Bar
                yAxisId="left"
                dataKey="processing_purchase_orders"
                fill="#FFB90A"
                 minPointSize={3}
                radius={[4, 4, 0, 0]}
                barSize={12}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="completion_rate"
                stroke="#0062FA"
                strokeWidth={2}
                dot={{ fill: "#0062FA", strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
                      )
                      }
      </div>
    </div>
  );
}
