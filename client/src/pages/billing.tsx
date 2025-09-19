import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import BarcodeScanner from "@/components/scanner/barcode-scanner";
import Receipt from "@/components/billing/receipt";
import { Plus, Minus, Trash2, ShoppingCart, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Product, Transaction, InsertTransaction } from "@shared/schema";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function Billing() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transactionData: InsertTransaction) => {
      const response = await apiRequest("POST", "/api/transactions", transactionData);
      return response.json() as Promise<Transaction>;
    },
    onSuccess: (transaction) => {
      setCompletedTransaction(transaction);
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscount(0);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      toast({
        title: "Sale Completed",
        description: `Transaction ${transaction.transactionNumber} created successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to complete transaction",
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: Product) => {
    if ((product.stock || 0) <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock`,
        variant: "destructive",
      });
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= (product.stock || 0)) {
          toast({
            title: "Insufficient Stock",
            description: `Only ${product.stock} ${product.unit} available`,
            variant: "destructive",
          });
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cart.find(item => item.product.id === productId);
    if (item && newQuantity > (item.product.stock || 0)) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${item.product.stock} ${item.product.unit} available`,
        variant: "destructive",
      });
      return;
    }

    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discount);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      });
      return;
    }

    const transactionData: InsertTransaction = {
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: parseFloat(item.product.price),
        quantity: item.quantity,
      })),
      totalAmount: calculateTotal().toFixed(2),
      discount: discount.toFixed(2),
      tax: "0.00",
      paymentMethod,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      status: "completed",
    };

    createTransactionMutation.mutate(transactionData);
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (completedTransaction) {
    return (
      <>
        <header className="bg-card border-b border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Transaction Complete</h2>
              <p className="text-sm text-muted-foreground">Receipt generated successfully</p>
            </div>
            <Button onClick={() => setCompletedTransaction(null)} data-testid="button-new-transaction">
              New Transaction
            </Button>
          </div>
        </header>

        <div className="p-6">
          <Receipt 
            transaction={completedTransaction}
            shopName={settings?.shopName}
            shopAddress={settings?.address}
            shopPhone={settings?.phone}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Billing System</h2>
            <p className="text-sm text-muted-foreground">Scan products and process sales</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" data-testid="cart-item-count">
              {cart.reduce((total, item) => total + item.quantity, 0)} items in cart
            </Badge>
            <Badge variant="outline" data-testid="cart-total">
              Total: {formatCurrency(calculateTotal())}
            </Badge>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Barcode Scanner */}
          <div className="lg:col-span-1">
            <BarcodeScanner onProductScanned={addToCart} />
          </div>

          {/* Shopping Cart */}
          <div className="lg:col-span-2">
            <Card className="p-6" data-testid="shopping-cart">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <ShoppingCart className="mr-2" />
                Shopping Cart
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Cart is empty</p>
                  <p className="text-sm text-muted-foreground">Scan products to add them to cart</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6" data-testid="cart-items">
                    {cart.map((item) => (
                      <div 
                        key={item.product.id} 
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                        data-testid={`cart-item-${item.product.id}`}
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(parseFloat(item.product.price))} each
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            data-testid={`button-decrease-${item.product.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium" data-testid={`quantity-${item.product.id}`}>
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.product.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.product.id)}
                            data-testid={`button-remove-${item.product.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="font-medium" data-testid={`item-total-${item.product.id}`}>
                            {formatCurrency(parseFloat(item.product.price) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="mb-4" />

                  {/* Discount and Total */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span>Subtotal:</span>
                      <span data-testid="cart-subtotal">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <label>Discount:</label>
                      <div className="flex items-center space-x-2">
                        <span>₹</span>
                        <Input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-20"
                          min="0"
                          step="0.01"
                          data-testid="input-discount"
                        />
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span data-testid="cart-final-total">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Customer Name</label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Optional"
                        data-testid="input-customer-name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number</label>
                      <Input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Optional"
                        data-testid="input-customer-phone"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={createTransactionMutation.isPending}
                    className="w-full"
                    size="lg"
                    data-testid="button-checkout"
                  >
                    <CreditCard className="mr-2" />
                    {createTransactionMutation.isPending ? "Processing..." : "Complete Sale"}
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
