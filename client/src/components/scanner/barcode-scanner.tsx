import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Camera, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

interface BarcodeScannerProps {
  onProductScanned?: (product: Product) => void;
}

export default function BarcodeScanner({ onProductScanned }: BarcodeScannerProps) {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [lastScannedBarcode, setLastScannedBarcode] = useState("");

  const { data: scannedProduct, isLoading } = useQuery({
    queryKey: ['/api/products/barcode', lastScannedBarcode],
    enabled: !!lastScannedBarcode,
  });

  const handleSearch = () => {
    if (barcodeInput.trim()) {
      setLastScannedBarcode(barcodeInput.trim());
      setBarcodeInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Notify parent component when product is found
  if (scannedProduct && onProductScanned) {
    onProductScanned(scannedProduct);
  }

  return (
    <Card className="p-6" data-testid="barcode-scanner-card">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Camera className="mr-2 text-primary" />
        Quick Scan
      </h3>
      
      <div className="bg-muted/50 rounded-lg p-8 text-center mb-4 border-3 border-dashed border-primary/30">
        <Camera className="text-4xl text-muted-foreground mb-3 mx-auto" />
        <p className="text-sm text-muted-foreground">Point camera at barcode</p>
        <p className="text-xs text-muted-foreground mt-1">or manually enter product code</p>
      </div>
      
      <Input 
        type="text" 
        placeholder="Enter barcode manually..." 
        value={barcodeInput}
        onChange={(e) => setBarcodeInput(e.target.value)}
        onKeyPress={handleKeyPress}
        className="mb-3"
        data-testid="input-barcode"
      />
      
      <Button 
        onClick={handleSearch}
        disabled={!barcodeInput.trim() || isLoading}
        className="w-full"
        data-testid="button-search-product"
      >
        <Search className="mr-2 h-4 w-4" />
        {isLoading ? "Searching..." : "Search Product"}
      </Button>
      
      {/* Last Scanned Item */}
      {scannedProduct && (
        <div className="mt-4 p-3 bg-secondary rounded-lg" data-testid="last-scanned-product">
          <p className="text-xs text-muted-foreground">Last Scanned:</p>
          <p className="font-medium" data-testid="product-name">{scannedProduct.name}</p>
          <p className="text-sm text-primary" data-testid="product-price">₹{scannedProduct.price}</p>
          {scannedProduct.stock !== undefined && (
            <p className="text-xs text-muted-foreground" data-testid="product-stock">
              Stock: {scannedProduct.stock} {scannedProduct.unit}
            </p>
          )}
        </div>
      )}

      {lastScannedBarcode && !scannedProduct && !isLoading && (
        <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20" data-testid="product-not-found">
          <p className="text-sm text-destructive">Product not found for barcode: {lastScannedBarcode}</p>
        </div>
      )}
    </Card>
  );
}
