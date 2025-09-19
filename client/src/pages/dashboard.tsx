import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, AlertTriangle } from "lucide-react";
import MetricsCards from "@/components/dashboard/metrics-cards";
import SalesChart from "@/components/dashboard/sales-chart";
import BarcodeScanner from "@/components/scanner/barcode-scanner";
import AiChat from "@/components/chat/ai-chat";
import type { SalesAnalytics, InventoryAlert, Transaction, ShopSettings } from "@shared/schema";

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<SalesAnalytics>({
    queryKey: ['/api/analytics/daily'],
  });

  const { data: alerts } = useQuery<InventoryAlert[]>({
    queryKey: ['/api/inventory-alerts'],
  });

  const { data: recentTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: settings } = useQuery<ShopSettings>({
    queryKey: ['/api/settings'],
  });

  const formatCurrency = (amount: string | number) => 
    `₹${parseFloat(amount.toString()).toLocaleString('en-IN')}`;

  if (analyticsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Welcome back! Here's your shop overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button data-testid="button-quick-sale">
              <Plus className="mr-2 h-4 w-4" />
              Quick Sale
            </Button>
            <div className="text-right">
              <p className="text-sm font-medium" data-testid="shop-name">
                {settings?.shopName || "Loading..."}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="current-date">
                Today: {new Date().toLocaleDateString('en-IN', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Metrics Cards */}
        <MetricsCards analytics={analytics} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Barcode Scanner Section */}
          <div className="lg:col-span-1 space-y-6">
            <BarcodeScanner />

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-new-sale">
                  <Plus className="mr-2 h-4 w-4" />
                  New Sale
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-add-inventory">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Inventory
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" data-testid="button-print-receipt">
                  <Plus className="mr-2 h-4 w-4" />
                  Print Receipt
                </Button>
              </div>
            </Card>
          </div>

          {/* Sales Analytics */}
          <div className="lg:col-span-2">
            <SalesChart analytics={analytics} />
          </div>
        </div>

        {/* AI Assistant & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Assistant */}
          <AiChat />

          {/* Recent Transactions */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Button variant="link" className="text-primary hover:underline p-0" data-testid="button-view-all-transactions">
                View All
              </Button>
            </div>
            
            <div className="space-y-3" data-testid="recent-transactions-list">
              {recentTransactions?.slice(0, 5).map((transaction, index) => {
                const items = transaction.items as any[];
                const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
                
                return (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                    data-testid={`transaction-item-${index}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.paymentMethod === 'cash' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        <span className={`text-sm font-bold ${
                          transaction.paymentMethod === 'cash' ? 'text-green-600' : 'text-blue-600'
                        }`}>
                          {transaction.paymentMethod === 'cash' ? '₹' : '💳'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm" data-testid={`transaction-number-${index}`}>
                          Transaction #{transaction.transactionNumber}
                        </p>
                        <p className="text-xs text-muted-foreground" data-testid={`transaction-time-${index}`}>
                          {new Date(transaction.createdAt!).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {transaction.paymentMethod.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600" data-testid={`transaction-amount-${index}`}>
                        {formatCurrency(transaction.totalAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`transaction-items-${index}`}>
                        {itemCount} items
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Transaction Summary */}
            <div className="mt-4 p-3 bg-secondary rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Today's Total:</span>
                <span className="font-medium text-foreground" data-testid="daily-total-summary">
                  {formatCurrency(analytics.dailySales)} ({analytics.itemsSold} transactions)
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Inventory Alerts */}
        {alerts && alerts.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="mr-2 text-destructive" />
              Inventory Alerts
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="inventory-alerts-grid">
              {alerts.map((alert, alertIndex) => {
                let bgColor = "bg-red-50 dark:bg-red-900/20";
                let borderColor = "border-red-200 dark:border-red-800";
                let textColor = "text-red-800 dark:text-red-200";
                let buttonColor = "bg-red-600 hover:bg-red-700";
                
                if (alert.type === 'out_of_stock') {
                  bgColor = "bg-orange-50 dark:bg-orange-900/20";
                  borderColor = "border-orange-200 dark:border-orange-800";
                  textColor = "text-orange-800 dark:text-orange-200";
                  buttonColor = "bg-orange-600 hover:bg-orange-700";
                } else if (alert.type === 'expiring_soon') {
                  bgColor = "bg-yellow-50 dark:bg-yellow-900/20";
                  borderColor = "border-yellow-200 dark:border-yellow-800";
                  textColor = "text-yellow-800 dark:text-yellow-200";
                  buttonColor = "bg-yellow-600 hover:bg-yellow-700";
                }

                const title = alert.type === 'low_stock' ? 'Low Stock' :
                            alert.type === 'out_of_stock' ? 'Out of Stock' : 'Expiring Soon';

                return (
                  <div 
                    key={alertIndex} 
                    className={`p-4 rounded-lg border ${bgColor} ${borderColor}`}
                    data-testid={`alert-${alert.type}`}
                  >
                    <h4 className={`font-medium mb-2 ${textColor}`}>
                      {title} ({alert.products.length} items)
                    </h4>
                    <div className="space-y-2">
                      {alert.products.slice(0, 3).map((product, productIndex) => (
                        <div key={product.id} className={`text-sm ${textColor.replace('800', '700').replace('200', '300')}`}>
                          • {product.name} ({product.currentStock} left)
                          {product.daysToExpiry && ` - ${product.daysToExpiry} days`}
                        </div>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      className={`mt-3 text-xs text-white ${buttonColor}`}
                      data-testid={`button-${alert.type}-action`}
                    >
                      {alert.type === 'low_stock' ? 'Create Purchase Order' :
                       alert.type === 'out_of_stock' ? 'Mark as Priority' : 'Apply Discount'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
