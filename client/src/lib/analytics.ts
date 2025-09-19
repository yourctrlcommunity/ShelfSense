import type { Transaction, Product, SalesAnalytics } from "@shared/schema";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SalesMetrics {
  totalSales: number;
  totalTransactions: number;
  averageOrderValue: number;
  totalItems: number;
  totalDiscount: number;
  profitMargin: number;
}

export interface ProductPerformance {
  productId: string;
  name: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  margin: number;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  itemsSold: number;
  averagePrice: number;
  profitMargin: number;
}

export interface TrendData {
  date: string;
  sales: number;
  transactions: number;
  items: number;
  profit: number;
}

/**
 * Calculate comprehensive sales metrics for a given period
 */
export function calculateSalesMetrics(
  transactions: Transaction[],
  products: Product[],
  dateRange?: DateRange
): SalesMetrics {
  const filteredTransactions = dateRange 
    ? transactions.filter(t => {
        const date = new Date(t.createdAt!);
        return date >= dateRange.start && date <= dateRange.end;
      })
    : transactions;

  const totalSales = filteredTransactions.reduce(
    (sum, t) => sum + parseFloat(t.totalAmount), 0
  );

  const totalTransactions = filteredTransactions.length;

  const totalItems = filteredTransactions.reduce((sum, t) => {
    const items = t.items as any[];
    return sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  const totalDiscount = filteredTransactions.reduce(
    (sum, t) => sum + parseFloat(t.discount || "0"), 0
  );

  const averageOrderValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Calculate profit margin (simplified - using cost price vs selling price)
  const totalCost = filteredTransactions.reduce((sum, t) => {
    const items = t.items as any[];
    return sum + items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.productId);
      const costPrice = parseFloat(product?.costPrice || "0");
      return itemSum + (costPrice * item.quantity);
    }, 0);
  }, 0);

  const profitMargin = totalSales > 0 ? ((totalSales - totalCost) / totalSales) * 100 : 0;

  return {
    totalSales,
    totalTransactions,
    averageOrderValue,
    totalItems,
    totalDiscount,
    profitMargin,
  };
}

/**
 * Analyze product performance
 */
export function analyzeProductPerformance(
  transactions: Transaction[],
  products: Product[],
  limit: number = 10
): ProductPerformance[] {
  const productStats = new Map<string, {
    quantitySold: number;
    revenue: number;
    cost: number;
  }>();

  transactions.forEach(transaction => {
    const items = transaction.items as any[];
    items.forEach(item => {
      const current = productStats.get(item.productId) || {
        quantitySold: 0,
        revenue: 0,
        cost: 0,
      };

      const product = products.find(p => p.id === item.productId);
      const costPrice = parseFloat(product?.costPrice || "0");

      productStats.set(item.productId, {
        quantitySold: current.quantitySold + item.quantity,
        revenue: current.revenue + (item.price * item.quantity),
        cost: current.cost + (costPrice * item.quantity),
      });
    });
  });

  const performance: ProductPerformance[] = Array.from(productStats.entries())
    .map(([productId, stats]) => {
      const product = products.find(p => p.id === productId);
      const profit = stats.revenue - stats.cost;
      const margin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0;

      return {
        productId,
        name: product?.name || "Unknown Product",
        quantitySold: stats.quantitySold,
        revenue: stats.revenue,
        profit,
        margin,
      };
    })
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);

  return performance;
}

/**
 * Analyze category performance
 */
export function analyzeCategoryPerformance(
  transactions: Transaction[],
  products: Product[]
): CategoryPerformance[] {
  const categoryStats = new Map<string, {
    revenue: number;
    itemsSold: number;
    totalCost: number;
  }>();

  transactions.forEach(transaction => {
    const items = transaction.items as any[];
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;

      const category = product.category;
      const current = categoryStats.get(category) || {
        revenue: 0,
        itemsSold: 0,
        totalCost: 0,
      };

      const costPrice = parseFloat(product.costPrice || "0");

      categoryStats.set(category, {
        revenue: current.revenue + (item.price * item.quantity),
        itemsSold: current.itemsSold + item.quantity,
        totalCost: current.totalCost + (costPrice * item.quantity),
      });
    });
  });

  return Array.from(categoryStats.entries())
    .map(([category, stats]) => {
      const averagePrice = stats.itemsSold > 0 ? stats.revenue / stats.itemsSold : 0;
      const profit = stats.revenue - stats.totalCost;
      const profitMargin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0;

      return {
        category,
        revenue: stats.revenue,
        itemsSold: stats.itemsSold,
        averagePrice,
        profitMargin,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * Generate trend data for charts
 */
export function generateTrendData(
  transactions: Transaction[],
  products: Product[],
  days: number = 7
): TrendData[] {
  const trendData: TrendData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.createdAt!);
      return transactionDate.toDateString() === date.toDateString();
    });

    const sales = dayTransactions.reduce(
      (sum, t) => sum + parseFloat(t.totalAmount), 0
    );

    const transactionCount = dayTransactions.length;

    const items = dayTransactions.reduce((sum, t) => {
      const items = t.items as any[];
      return sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    // Calculate profit for the day
    const cost = dayTransactions.reduce((sum, t) => {
      const items = t.items as any[];
      return sum + items.reduce((itemSum, item) => {
        const product = products.find(p => p.id === item.productId);
        const costPrice = parseFloat(product?.costPrice || "0");
        return itemSum + (costPrice * item.quantity);
      }, 0);
    }, 0);

    const profit = sales - cost;

    trendData.push({
      date: dateStr,
      sales,
      transactions: transactionCount,
      items,
      profit,
    });
  }

  return trendData;
}

/**
 * Calculate inventory turnover rate
 */
export function calculateInventoryTurnover(
  product: Product,
  transactions: Transaction[],
  days: number = 30
): number {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  const recentTransactions = transactions.filter(t => 
    new Date(t.createdAt!) >= cutoffDate
  );

  const quantitySold = recentTransactions.reduce((sum, t) => {
    const items = t.items as any[];
    const productItems = items.filter(item => item.productId === product.id);
    return sum + productItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
  }, 0);

  const averageStock = product.stock || 0;
  const turnoverRate = averageStock > 0 ? quantitySold / averageStock : 0;

  return turnoverRate;
}

/**
 * Identify slow-moving products
 */
export function identifySlowMovingProducts(
  products: Product[],
  transactions: Transaction[],
  threshold: number = 0.1
): Product[] {
  return products.filter(product => {
    const turnover = calculateInventoryTurnover(product, transactions);
    return turnover < threshold && (product.stock || 0) > 0;
  });
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = "INR"): string {
  const currencySymbols: { [key: string]: string } = {
    INR: "₹",
    USD: "$",
    EUR: "€",
  };

  const symbol = currencySymbols[currency] || "₹";
  return `${symbol}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get business insights based on data analysis
 */
export function generateBusinessInsights(
  analytics: SalesAnalytics,
  products: Product[],
  transactions: Transaction[]
): string[] {
  const insights: string[] = [];

  // Profit margin insights
  if (analytics.profitMargin < 15) {
    insights.push("Consider reviewing pricing strategy - profit margin is below 15%");
  } else if (analytics.profitMargin > 30) {
    insights.push("Excellent profit margin! Consider expanding high-margin products");
  }

  // Stock insights
  if (analytics.lowStockItems > 5) {
    insights.push(`${analytics.lowStockItems} products are running low - schedule reorders`);
  }

  // Sales performance insights
  if (analytics.itemsSold > 100) {
    insights.push("Strong sales volume today - consider increasing stock for popular items");
  }

  // Category insights
  if (analytics.topCategories.length > 0) {
    const topCategory = analytics.topCategories[0];
    insights.push(`${topCategory.name} is your top performing category`);
  }

  return insights;
}
