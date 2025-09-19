import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { SalesAnalytics } from "@shared/schema";

interface SalesChartProps {
  analytics: SalesAnalytics;
}

export default function SalesChart({ analytics }: SalesChartProps) {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <Card className="p-6" data-testid="sales-chart-container">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Sales Analytics</h3>
        <div className="flex space-x-2">
          <Button variant="default" size="sm" data-testid="button-7-days">
            7 Days
          </Button>
          <Button variant="secondary" size="sm" data-testid="button-30-days">
            30 Days
          </Button>
          <Button variant="secondary" size="sm" data-testid="button-3-months">
            3 Months
          </Button>
        </div>
      </div>
      
      <div className="h-64 mb-6" data-testid="sales-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={analytics.salesTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-muted-foreground"
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            />
            <YAxis 
              className="text-muted-foreground"
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Sales']}
              labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div data-testid="top-categories-section">
          <h4 className="font-medium mb-3">Top Categories</h4>
          <div className="space-y-2">
            {analytics.topCategories.map((category, index) => (
              <div 
                key={category.name} 
                className="flex items-center justify-between p-2 bg-secondary rounded"
                data-testid={`category-item-${index}`}
              >
                <span className="text-sm">{category.name}</span>
                <span className="text-sm font-medium text-primary">
                  {formatCurrency(category.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div data-testid="top-products-section">
          <h4 className="font-medium mb-3">Top Products</h4>
          <div className="space-y-2">
            {analytics.topProducts.map((product, index) => (
              <div 
                key={product.name} 
                className="flex items-center justify-between p-2 bg-secondary rounded"
                data-testid={`product-item-${index}`}
              >
                <span className="text-sm">{product.name}</span>
                <span className="text-sm font-medium text-green-600">
                  {product.quantity} sold
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
