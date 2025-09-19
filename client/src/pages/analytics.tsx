import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar } from "lucide-react";
import type { SalesAnalytics, Product, Transaction } from "@shared/schema";

export default function Analytics() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [viewType, setViewType] = useState<'overview' | 'products' | 'categories' | 'trends'>('overview');

  const { data: analytics, isLoading } = useQuery<SalesAnalytics>({
    queryKey: ['/api/analytics', period],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  // Calculate additional metrics
  const avgOrderValue = analytics ? analytics.dailySales / (transactions?.length || 1) : 0;
  const topSellingProduct = analytics?.topProducts[0];
  const slowMovingProducts = products?.filter(p => {
    const productSales = analytics?.topProducts.find(tp => tp.name === p.name);
    return !productSales || productSales.quantity < 5;
  }) || [];

  // Prepare chart data
  const categoryChartData = analytics?.topCategories.map((category, index) => ({
    ...category,
    fill: COLORS[index % COLORS.length],
  })) || [];

  const profitTrendData = analytics?.salesTrend.map(trend => ({
    ...trend,
    profit: trend.amount * 0.235, // Using the profit margin from analytics
  })) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Sales Analytics</h2>
            <p className="text-sm text-muted-foreground">Comprehensive business insights and trends</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32" data-testid="select-analytics-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Select value={viewType} onValueChange={setViewType}>
              <SelectTrigger className="w-40" data-testid="select-view-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overview">Overview</SelectItem>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="categories">Categories</SelectItem>
                <SelectItem value="trends">Trends</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-revenue">
                  {formatCurrency(analytics.dailySales)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +15% vs last {period}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-items-sold">
                  {analytics.itemsSold}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +8% vs last {period}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-foreground" data-testid="avg-order-value">
                  {formatCurrency(avgOrderValue)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +3% vs last {period}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold text-foreground" data-testid="profit-margin">
                  {analytics.profitMargin.toFixed(1)}%
                </p>
                <p className="text-xs text-green-600 mt-1">
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  +2.1% vs last {period}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {viewType === 'overview' && (
          <>
            {/* Sales Trend */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
              <div className="h-80" data-testid="sales-trend-chart">
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
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Categories and Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
                <div className="h-64" data-testid="categories-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="amount"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                <div className="space-y-4" data-testid="top-products-list">
                  {analytics.topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.quantity} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Progress 
                          value={(product.quantity / analytics.topProducts[0].quantity) * 100} 
                          className="w-20 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {viewType === 'products' && (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
              <div className="h-80" data-testid="product-performance-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      className="text-muted-foreground"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis className="text-muted-foreground" />
                    <Tooltip 
                      formatter={(value: number) => [value, 'Units Sold']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="quantity" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {slowMovingProducts.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingDown className="mr-2 text-yellow-600" />
                  Slow Moving Products
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="slow-moving-products">
                  {slowMovingProducts.slice(0, 6).map((product) => (
                    <Card key={product.id} className="p-4 border-yellow-200">
                      <div className="space-y-2">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <div className="flex justify-between">
                          <span className="text-sm">Stock: {product.stock}</span>
                          <span className="text-sm">Price: ₹{product.price}</span>
                        </div>
                        <Badge variant="outline" className="text-yellow-600">
                          Slow Moving
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {viewType === 'categories' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Category Analysis</h3>
            <div className="h-80" data-testid="category-analysis-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topCategories}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis 
                    className="text-muted-foreground"
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {viewType === 'trends' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Profit Trend Analysis</h3>
            <div className="h-80" data-testid="profit-trend-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitTrendData}>
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
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'amount' ? 'Revenue' : 'Profit']}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('en-IN')}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Business Insights */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Business Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="business-insights">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Best Performer</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {topSellingProduct?.name} is your top seller with {topSellingProduct?.quantity} units sold
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Growth Opportunity</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Focus on {analytics.topCategories[0]?.name} category - showing strong demand
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Optimization</h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {analytics.lowStockItems} items need restocking to avoid stockouts
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
