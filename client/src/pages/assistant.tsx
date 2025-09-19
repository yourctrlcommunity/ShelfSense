import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AiChat from "@/components/chat/ai-chat";
import { Bot, Lightbulb, TrendingUp, Package, AlertTriangle, DollarSign } from "lucide-react";
import type { SalesAnalytics, InventoryAlert, Product } from "@shared/schema";

interface InsightCard {
  title: string;
  description: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: React.ReactNode;
  action?: string;
}

export default function Assistant() {
  const [activeInsight, setActiveInsight] = useState<string | null>(null);

  const { data: analytics } = useQuery<SalesAnalytics>({
    queryKey: ['/api/analytics/weekly'],
  });

  const { data: alerts } = useQuery<InventoryAlert[]>({
    queryKey: ['/api/inventory-alerts'],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  // Generate AI insights based on data
  const generateInsights = (): InsightCard[] => {
    const insights: InsightCard[] = [];

    if (analytics) {
      // Sales performance insights
      if (analytics.dailySales > 10000) {
        insights.push({
          title: "Strong Sales Performance",
          description: `Your daily sales of ${formatCurrency(analytics.dailySales)} are performing well. Consider expanding popular product categories.`,
          type: "success",
          icon: <TrendingUp className="h-5 w-5" />,
          action: "View top products"
        });
      }

      // Profit margin insights
      if (analytics.profitMargin < 20) {
        insights.push({
          title: "Profit Margin Optimization",
          description: `Your current profit margin of ${analytics.profitMargin.toFixed(1)}% could be improved. Review pricing strategies for better margins.`,
          type: "warning",
          icon: <DollarSign className="h-5 w-5" />,
          action: "Analyze pricing"
        });
      }

      // Top category insights
      if (analytics.topCategories.length > 0) {
        const topCategory = analytics.topCategories[0];
        insights.push({
          title: "Category Performance Leader",
          description: `${topCategory.name} is your best-performing category with ${formatCurrency(topCategory.amount)} in sales. Focus marketing efforts here.`,
          type: "info",
          icon: <Package className="h-5 w-5" />,
          action: "View category details"
        });
      }
    }

    // Inventory insights
    if (alerts) {
      const lowStockAlert = alerts.find(alert => alert.type === 'low_stock');
      if (lowStockAlert && lowStockAlert.products.length > 0) {
        insights.push({
          title: "Stock Replenishment Required",
          description: `${lowStockAlert.products.length} products are running low on stock. Schedule reorders to avoid stockouts.`,
          type: "warning",
          icon: <AlertTriangle className="h-5 w-5" />,
          action: "View low stock items"
        });
      }

      const outOfStockAlert = alerts.find(alert => alert.type === 'out_of_stock');
      if (outOfStockAlert && outOfStockAlert.products.length > 0) {
        insights.push({
          title: "Urgent: Out of Stock Items",
          description: `${outOfStockAlert.products.length} products are completely out of stock. Immediate action required to restore availability.`,
          type: "danger",
          icon: <Package className="h-5 w-5" />,
          action: "Restock immediately"
        });
      }
    }

    // Product diversity insights
    if (products) {
      const totalProducts = products.length;
      const activeProducts = products.filter(p => (p.stock || 0) > 0).length;
      const diversityRatio = activeProducts / totalProducts;

      if (diversityRatio < 0.8) {
        insights.push({
          title: "Product Portfolio Optimization",
          description: `${((1 - diversityRatio) * 100).toFixed(0)}% of your products are out of stock. Consider diversifying your inventory.`,
          type: "info",
          icon: <Lightbulb className="h-5 w-5" />,
          action: "Review inventory"
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'danger': return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getInsightTextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-800 dark:text-green-200';
      case 'warning': return 'text-yellow-800 dark:text-yellow-200';
      case 'info': return 'text-blue-800 dark:text-blue-200';
      case 'danger': return 'text-red-800 dark:text-red-200';
      default: return 'text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <>
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <Bot className="mr-2 text-primary" />
              AI Business Assistant
            </h2>
            <p className="text-sm text-muted-foreground">Get intelligent insights and recommendations for your business</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary" data-testid="ai-status">
            AI Powered
          </Badge>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* AI Insights Dashboard */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="mr-2 text-yellow-500" />
            Smart Business Insights
          </h3>
          
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">AI is analyzing your business data...</p>
              <p className="text-sm text-muted-foreground mt-1">Insights will appear as data becomes available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="ai-insights-grid">
              {insights.map((insight, index) => (
                <Card 
                  key={index}
                  className={`p-4 border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    getInsightColor(insight.type)
                  } ${activeInsight === insight.title ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setActiveInsight(activeInsight === insight.title ? null : insight.title)}
                  data-testid={`insight-card-${index}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getInsightTextColor(insight.type)}`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium mb-1 ${getInsightTextColor(insight.type)}`}>
                        {insight.title}
                      </h4>
                      <p className={`text-sm ${getInsightTextColor(insight.type).replace('800', '700').replace('200', '300')}`}>
                        {insight.description}
                      </p>
                      {insight.action && (
                        <Button 
                          variant="link" 
                          className={`p-0 h-auto mt-2 ${getInsightTextColor(insight.type)}`}
                          data-testid={`insight-action-${index}`}
                        >
                          {insight.action} →
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* AI Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AiChat />
          </div>

          {/* Quick Actions & Suggestions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Questions</h3>
              <div className="space-y-2" data-testid="quick-questions">
                {[
                  "What are my best selling products?",
                  "Which items need restocking?",
                  "How is my profit margin trending?",
                  "What's my daily sales average?",
                  "Show me slow-moving inventory",
                  "Analyze my customer patterns"
                ].map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto p-3 whitespace-normal"
                    data-testid={`quick-question-${index}`}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
              <div className="space-y-3" data-testid="ai-recommendations">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-1">
                    Optimize Inventory
                  </h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Based on sales patterns, consider increasing stock for high-demand items.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-800 dark:text-green-200 text-sm mb-1">
                    Seasonal Planning
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Prepare for upcoming seasonal changes in customer demand.
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 text-sm mb-1">
                    Pricing Strategy
                  </h4>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Review pricing for optimal profit margins without losing customers.
                  </p>
                </div>
              </div>
            </Card>

            {/* Performance Summary */}
            {analytics && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                <div className="space-y-3" data-testid="performance-summary">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sales Today</span>
                    <span className="font-medium">{formatCurrency(analytics.dailySales)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Items Sold</span>
                    <span className="font-medium">{analytics.itemsSold}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Profit Margin</span>
                    <Badge variant={analytics.profitMargin > 20 ? 'default' : 'secondary'}>
                      {analytics.profitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Low Stock Alerts</span>
                    <Badge variant={analytics.lowStockItems > 0 ? 'destructive' : 'default'}>
                      {analytics.lowStockItems}
                    </Badge>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
