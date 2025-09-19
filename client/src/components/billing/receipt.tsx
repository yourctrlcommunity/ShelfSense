import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download } from "lucide-react";
import type { Transaction } from "@shared/schema";

interface ReceiptProps {
  transaction: Transaction;
  shopName?: string;
  shopAddress?: string;
  shopPhone?: string;
}

export default function Receipt({ transaction, shopName, shopAddress, shopPhone }: ReceiptProps) {
  const formatCurrency = (amount: string | number) => 
    `₹${parseFloat(amount.toString()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const items = transaction.items as any[];
  const subtotal = parseFloat(transaction.totalAmount) + parseFloat(transaction.discount || "0");

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement PDF generation
    console.log("Download receipt as PDF");
  };

  return (
    <Card className="p-6 max-w-md mx-auto" data-testid="receipt-container">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" data-testid="shop-name">
          {shopName || "Shop Name"}
        </h2>
        {shopAddress && (
          <p className="text-sm text-muted-foreground" data-testid="shop-address">
            {shopAddress}
          </p>
        )}
        {shopPhone && (
          <p className="text-sm text-muted-foreground" data-testid="shop-phone">
            Phone: {shopPhone}
          </p>
        )}
      </div>

      <Separator className="mb-4" />

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Receipt #:</span>
          <span className="font-medium" data-testid="transaction-number">
            {transaction.transactionNumber}
          </span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Date:</span>
          <span data-testid="transaction-date">
            {new Date(transaction.createdAt!).toLocaleDateString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Time:</span>
          <span data-testid="transaction-time">
            {new Date(transaction.createdAt!).toLocaleTimeString('en-IN')}
          </span>
        </div>
      </div>

      <Separator className="mb-4" />

      <div className="mb-4" data-testid="receipt-items">
        {items.map((item, index) => (
          <div key={index} className="mb-3" data-testid={`receipt-item-${index}`}>
            <div className="flex justify-between">
              <span className="font-medium">{item.name}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{item.quantity} × {formatCurrency(item.price)}</span>
            </div>
          </div>
        ))}
      </div>

      <Separator className="mb-4" />

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span data-testid="receipt-subtotal">{formatCurrency(subtotal)}</span>
        </div>
        {parseFloat(transaction.discount || "0") > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount:</span>
            <span data-testid="receipt-discount">-{formatCurrency(transaction.discount || "0")}</span>
          </div>
        )}
        {parseFloat(transaction.tax || "0") > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span data-testid="receipt-tax">{formatCurrency(transaction.tax || "0")}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span data-testid="receipt-total">{formatCurrency(transaction.totalAmount)}</span>
        </div>
      </div>

      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">
          Payment Method: <span className="font-medium capitalize" data-testid="payment-method">
            {transaction.paymentMethod}
          </span>
        </p>
      </div>

      <div className="flex gap-2">
        <Button onClick={handlePrint} variant="outline" className="flex-1" data-testid="button-print">
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex-1" data-testid="button-download">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      <div className="text-center mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Thank you for shopping with us!
        </p>
      </div>
    </Card>
  );
}
