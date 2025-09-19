import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BarcodeScanner from "@/components/scanner/barcode-scanner";
import { Search, Package, AlertCircle } from "lucide-react";
import type { Product } from "@shared/schema";

export default function Scanner() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductScanned = (product: Product) => {
    setSelectedProduct(product);
  };

  const getStockStatus = (product: Product) => {
    const stock = product.stock || 0;
    const minStock = product.minStock || 5;
    
    if (stock === 0) return { status: 'out', color: 'destructive', text: 'Out of Stock' };
    if (stock <= minStock) return { status: 'low', color: 'warning', text: 'Low Stock' };
    return { status: 'good', color: 'success', text: 'In Stock' };
  };

  return (
    <>
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Barcode Scanner</h2>
            <p className="text-sm text-muted-foreground">Scan products or search manually</p>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="space-y-6">
            <BarcodeScanner onProductScanned={handleProductScanned} />
            
            {/* Selected Product Details */}
            {selectedProduct && (
              <Card className="p-6" data-testid="selected-product-details">
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium" data-testid="selected-product-name">
                      {selectedProduct.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium text-lg text-primary" data-testid="selected-product-price">
                      ₹{selectedProduct.price}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <Badge variant="secondary" data-testid="selected-product-category">
                      {selectedProduct.category}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium" data-testid="selected-product-stock">
                        {selectedProduct.stock} {selectedProduct.unit}
                      </span>
                      <Badge 
                        variant={getStockStatus(selectedProduct).status === 'good' ? 'default' : 'destructive'}
                        data-testid="selected-product-stock-status"
                      >
                        {getStockStatus(selectedProduct).text}
                      </Badge>
                    </div>
                  </div>
                  {selectedProduct.barcode && (
                    <div>
                      <p className="text-sm text-muted-foreground">Barcode</p>
                      <p className="font-mono text-sm" data-testid="selected-product-barcode">
                        {selectedProduct.barcode}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Product Search */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Search</h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, barcode, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-product-search"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2" data-testid="product-search-results">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredProducts?.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "No products found" : "No products available"}
                    </p>
                  </div>
                ) : (
                  filteredProducts?.map((product) => {
                    const stockStatus = getStockStatus(product);
                    
                    return (
                      <div
                        key={product.id}
                        className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedProduct(product)}
                        data-testid={`product-search-item-${product.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.category} • ₹{product.price}
                            </p>
                            {product.barcode && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {product.barcode}
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <Badge 
                              variant={stockStatus.status === 'good' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {stockStatus.text}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              {product.stock} {product.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Products:</span>
                  <span className="font-medium" data-testid="total-products-count">
                    {products?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Low Stock Items:</span>
                  <span className="font-medium text-yellow-600" data-testid="low-stock-count">
                    {products?.filter(p => (p.stock || 0) <= (p.minStock || 5) && (p.stock || 0) > 0).length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Out of Stock:</span>
                  <span className="font-medium text-destructive" data-testid="out-of-stock-count">
                    {products?.filter(p => (p.stock || 0) === 0).length || 0}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
