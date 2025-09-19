import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Download, FileText, Calendar, Filter, TrendingUp, Package } from "lucide-react";
import type { Transaction, Product, SalesAnalytics } from "@shared/schema";
import { DateRange } from "react-day-picker";

export default function Reports() {
  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'transactions' | 'profit'>('sales');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: analytics } = useQuery<SalesAnalytics>({
    queryKey: ['/api/analytics/monthly'],
  });

  const formatCurrency = (amount: string | number) => 
    `₹${parseFloat(amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const formatDate = (date: string | Date) => 
    new Date(date).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

  // Filter transactions by date range
  const filteredTransactions = transactions?.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt!);
    const matchesSearch = !searchTerm || 
      transaction.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDateRange = !dateRange?.from || !dateRange?.to || 
      (transactionDate >= dateRange.from && transactionDate <= dateRange.to);
    
    return matchesSearch && matchesDateRange;
  });

  // Filter products for inventory report
  const filteredProducts = products?.filter(product => 
    !searchTerm || 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate report totals
  const reportTotals = {
    totalSales: filteredTransactions?.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0) || 0,
    totalTransactions: filteredTransactions?.length || 0,
    totalItems: filteredTransactions?.reduce((sum, t) => {
      const items = t.items as any[];
      return sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0) || 0,
    totalDiscount: filteredTransactions?.reduce((sum, t) => sum + parseFloat(t.discount || "0"), 0) || 0,
  };

  const handleExportCSV = () => {
    let csvContent = "";
    let filename = "";

    switch (reportType) {
      case 'sales':
        csvContent = "Date,Transaction Number,Customer,Items,Amount,Payment Method\n";
        filteredTransactions?.forEach(transaction => {
          const items = transaction.items as any[];
          const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
          csvContent += `${formatDate(transaction.createdAt!)},${transaction.transactionNumber},${transaction.customerName || 'N/A'},${itemCount},${transaction.totalAmount},${transaction.paymentMethod}\n`;
        });
        filename = "sales-report.csv";
        break;
      
      case 'inventory':
        csvContent = "Product Name,Category,Brand,Price,Stock,Min Stock,Status\n";
        filteredProducts?.forEach(product => {
          const status = (product.stock || 0) === 0 ? 'Out of Stock' : 
                        (product.stock || 0) <= (product.minStock || 5) ? 'Low Stock' : 'In Stock';
          csvContent += `${product.name},${product.category},${product.brand || 'N/A'},${product.price},${product.stock},${product.minStock},${status}\n`;
        });
        filename = "inventory-report.csv";
        break;
      
      case 'transactions':
        csvContent = "Date,Time,Transaction Number,Customer,Payment Method,Amount,Status\n";
        filteredTransactions?.forEach(transaction => {
          const date = new Date(transaction.createdAt!);
          csvContent += `${formatDate(date)},${date.toLocaleTimeString('en-IN')},${transaction.transactionNumber},${transaction.customerName || 'N/A'},${transaction.paymentMethod},${transaction.totalAmount},${transaction.status}\n`;
        });
        filename = "transactions-report.csv";
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isLoading = transactionsLoading || productsLoading;

  return (
    <>
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Reports & Analytics</h2>
            <p className="text-sm text-muted-foreground">Generate comprehensive business reports</p>
          </div>
          <Button onClick={handleExportCSV} data-testid="button-export-csv">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Report Filters */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Filter className="mr-2" />
            Report Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="transactions">Transaction Report</SelectItem>
                  <SelectItem value="profit">Profit Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <DatePickerWithRange 
                date={dateRange} 
                setDate={setDateRange} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-reports"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm("");
                  setDateRange(undefined);
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Report Summary */}
        {reportType === 'sales' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-xl font-bold text-foreground" data-testid="total-sales-summary">
                    {formatCurrency(reportTotals.totalSales)}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-xl font-bold text-foreground" data-testid="total-transactions-summary">
                    {reportTotals.totalTransactions}
                  </p>
                </div>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Items Sold</p>
                  <p className="text-xl font-bold text-foreground" data-testid="total-items-summary">
                    {reportTotals.totalItems}
                  </p>
                </div>
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Discount</p>
                  <p className="text-xl font-bold text-foreground" data-testid="total-discount-summary">
                    {formatCurrency(reportTotals.totalDiscount)}
                  </p>
                </div>
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </Card>
          </div>
        )}

        {/* Report Content */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {reportType === 'sales' && 'Sales Report'}
              {reportType === 'inventory' && 'Inventory Report'}
              {reportType === 'transactions' && 'Transaction Report'}
              {reportType === 'profit' && 'Profit Analysis'}
            </h3>
            <Badge variant="secondary" data-testid="report-item-count">
              {reportType === 'inventory' 
                ? `${filteredProducts?.length || 0} products`
                : `${filteredTransactions?.length || 0} records`
              }
            </Badge>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse h-12 bg-muted rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {reportType === 'sales' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-testid="sales-report-table">
                    {filteredTransactions?.map((transaction) => {
                      const items = transaction.items as any[];
                      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
                      
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.createdAt!)}</TableCell>
                          <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                          <TableCell>{transaction.customerName || 'Walk-in Customer'}</TableCell>
                          <TableCell>{itemCount} items</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {transaction.paymentMethod}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(transaction.totalAmount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {reportType === 'inventory' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Min Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-testid="inventory-report-table">
                    {filteredProducts?.map((product) => {
                      const stock = product.stock || 0;
                      const minStock = product.minStock || 5;
                      
                      let status = 'In Stock';
                      let statusColor = 'default';
                      
                      if (stock === 0) {
                        status = 'Out of Stock';
                        statusColor = 'destructive';
                      } else if (stock <= minStock) {
                        status = 'Low Stock';
                        statusColor = 'warning';
                      }
                      
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.barcode && (
                                <p className="text-xs text-muted-foreground font-mono">
                                  {product.barcode}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.brand || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>{stock} {product.unit}</TableCell>
                          <TableCell>{minStock}</TableCell>
                          <TableCell>
                            <Badge variant={statusColor === 'default' ? 'default' : 'destructive'}>
                              {status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {reportType === 'transactions' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Transaction #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-testid="transactions-report-table">
                    {filteredTransactions?.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatDate(transaction.createdAt!)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.createdAt!).toLocaleTimeString('en-IN')}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                        <TableCell>{transaction.customerName || 'Walk-in Customer'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {transaction.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(transaction.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {reportType === 'profit' && analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Total Revenue</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(analytics.dailySales)}
                      </p>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Estimated Profit</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(analytics.dailySales * (analytics.profitMargin / 100))}
                      </p>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Profit Margin</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics.profitMargin.toFixed(1)}%
                      </p>
                    </Card>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Estimated Cost</TableHead>
                        <TableHead>Estimated Profit</TableHead>
                        <TableHead>Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody data-testid="profit-analysis-table">
                      {analytics.topCategories.map((category) => {
                        const estimatedCost = category.amount * 0.765; // Based on profit margin
                        const estimatedProfit = category.amount - estimatedCost;
                        const margin = (estimatedProfit / category.amount) * 100;
                        
                        return (
                          <TableRow key={category.name}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{formatCurrency(category.amount)}</TableCell>
                            <TableCell>{formatCurrency(estimatedCost)}</TableCell>
                            <TableCell className="text-green-600 font-medium">
                              {formatCurrency(estimatedProfit)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={margin > 20 ? 'default' : 'secondary'}>
                                {margin.toFixed(1)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {((reportType === 'inventory' && filteredProducts?.length === 0) ||
                (['sales', 'transactions'].includes(reportType) && filteredTransactions?.length === 0)) && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No data found for the selected filters</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
