import { Card } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, AlertTriangle, PieChart, IndianRupee } from "lucide-react";
import type { SalesAnalytics } from "@shared/schema";

interface MetricsCardsProps {
  analytics: SalesAnalytics;
}

export default function MetricsCards({ analytics }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
  
  const metrics = [
    {
      title: "Today's Sales",
      value: formatCurrency(analytics.dailySales),
      change: "+15% from yesterday",
      icon: IndianRupee,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      changeColor: "text-green-600",
    },
    {
      title: "Items Sold",
      value: analytics.itemsSold.toString(),
      change: "+8% from yesterday",
      icon: ShoppingCart,
      bgColor: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600",
      changeColor: "text-green-600",
    },
    {
      title: "Low Stock Items",
      value: analytics.lowStockItems.toString(),
      change: "Needs attention",
      icon: AlertTriangle,
      bgColor: "bg-red-100 dark:bg-red-900/20",
      iconColor: "text-destructive",
      changeColor: "text-muted-foreground",
    },
    {
      title: "Profit Margin",
      value: `${analytics.profitMargin.toFixed(1)}%`,
      change: "+2.1% this week",
      icon: PieChart,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600",
      changeColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card 
            key={index}
            className="p-6 transition-transform duration-200 hover:scale-105 cursor-pointer"
            data-testid={`metric-card-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold text-foreground" data-testid={`metric-value-${index}`}>
                  {metric.value}
                </p>
                <p className={`text-xs mt-1 ${metric.changeColor}`}>
                  <TrendingUp className="inline w-3 h-3 mr-1" />
                  {metric.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <Icon className={`text-xl ${metric.iconColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
