import { 
  type Product, 
  type InsertProduct,
  type Transaction,
  type InsertTransaction,
  type Category,
  type InsertCategory,
  type InventoryMovement,
  type InsertInventoryMovement,
  type ShopSettings,
  type InsertShopSettings,
  type SalesAnalytics,
  type InventoryAlert
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductByBarcode(barcode: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  updateStock(productId: string, quantity: number): Promise<void>;

  // Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Inventory
  getInventoryMovements(productId?: string): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;

  // Settings
  getShopSettings(): Promise<ShopSettings | undefined>;
  updateShopSettings(settings: Partial<InsertShopSettings>): Promise<ShopSettings>;

  // Analytics
  getSalesAnalytics(period: 'daily' | 'weekly' | 'monthly'): Promise<SalesAnalytics>;
  getInventoryAlerts(): Promise<InventoryAlert[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private categories: Map<string, Category> = new Map();
  private inventoryMovements: Map<string, InventoryMovement> = new Map();
  private shopSettings: ShopSettings | undefined;
  private transactionCounter = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create initial categories
    const beveragesCategory: Category = {
      id: randomUUID(),
      name: "Beverages",
      description: "Cold drinks and beverages",
      isActive: true,
      createdAt: new Date(),
    };
    
    const snacksCategory: Category = {
      id: randomUUID(),
      name: "Snacks",
      description: "Snacks and quick bites",
      isActive: true,
      createdAt: new Date(),
    };

    const personalCareCategory: Category = {
      id: randomUUID(),
      name: "Personal Care",
      description: "Personal hygiene and care products",
      isActive: true,
      createdAt: new Date(),
    };

    this.categories.set(beveragesCategory.id, beveragesCategory);
    this.categories.set(snacksCategory.id, snacksCategory);
    this.categories.set(personalCareCategory.id, personalCareCategory);

    // Create sample products
    const products: Product[] = [
      {
        id: randomUUID(),
        name: "Coca Cola 600ml",
        barcode: "8901030001234",
        price: "25.00",
        costPrice: "20.00",
        category: "Beverages",
        brand: "Coca Cola",
        description: "Refreshing cola drink",
        stock: 45,
        minStock: 10,
        maxStock: 100,
        unit: "bottle",
        isActive: true,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Maggi 2-Minute Noodles",
        barcode: "8901030002345",
        price: "12.00",
        costPrice: "10.00",
        category: "Snacks",
        brand: "Nestle",
        description: "Instant noodles",
        stock: 8,
        minStock: 10,
        maxStock: 50,
        unit: "packet",
        isActive: true,
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Colgate Toothpaste",
        barcode: "8901030003456",
        price: "45.00",
        costPrice: "35.00",
        category: "Personal Care",
        brand: "Colgate",
        description: "Dental care toothpaste",
        stock: 3,
        minStock: 5,
        maxStock: 25,
        unit: "tube",
        isActive: true,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Britannia Biscuits",
        barcode: "8901030004567",
        price: "20.00",
        costPrice: "15.00",
        category: "Snacks",
        brand: "Britannia",
        description: "Cream biscuits",
        stock: 38,
        minStock: 10,
        maxStock: 60,
        unit: "packet",
        isActive: true,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    products.forEach(product => {
      this.products.set(product.id, product);
    });

    // Create initial shop settings
    this.shopSettings = {
      id: randomUUID(),
      shopName: "Ramesh General Store",
      ownerName: "Ramesh Kumar",
      address: "123 Market Street, Delhi",
      phone: "+91 98765 43210",
      email: "ramesh@store.com",
      gstNumber: "07AAACR1234A1Z5",
      currency: "INR",
      timezone: "Asia/Kolkata",
      receiptFooter: "Thank you for shopping with us!",
      isOfflineMode: false,
      lastSyncAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByBarcode(barcode: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.barcode === barcode);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      ...insertProduct,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) {
      throw new Error("Product not found");
    }
    
    const updated: Product = {
      ...existing,
      ...updateData,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const previousStock = product.stock || 0;
    const newStock = Math.max(0, previousStock + quantity);
    
    const updated: Product = {
      ...product,
      stock: newStock,
      updatedAt: new Date(),
    };
    this.products.set(productId, updated);

    // Create inventory movement record
    const movement: InventoryMovement = {
      id: randomUUID(),
      productId,
      type: quantity > 0 ? "purchase" : "sale",
      quantity: Math.abs(quantity),
      previousStock,
      newStock,
      reason: quantity > 0 ? "Stock added" : "Sale",
      createdAt: new Date(),
    };
    this.inventoryMovements.set(movement.id, movement);
  }

  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      ...insertTransaction,
      id: randomUUID(),
      transactionNumber: `TXN${String(this.transactionCounter++).padStart(4, '0')}`,
      createdAt: new Date(),
    };

    // Update stock for each item
    const items = insertTransaction.items as any[];
    for (const item of items) {
      await this.updateStock(item.productId, -item.quantity);
    }

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(t => {
      const transactionDate = new Date(t.createdAt!);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      ...insertCategory,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async getInventoryMovements(productId?: string): Promise<InventoryMovement[]> {
    const movements = Array.from(this.inventoryMovements.values());
    if (productId) {
      return movements.filter(m => m.productId === productId);
    }
    return movements.sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createInventoryMovement(insertMovement: InsertInventoryMovement): Promise<InventoryMovement> {
    const movement: InventoryMovement = {
      ...insertMovement,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.inventoryMovements.set(movement.id, movement);
    return movement;
  }

  async getShopSettings(): Promise<ShopSettings | undefined> {
    return this.shopSettings;
  }

  async updateShopSettings(updateData: Partial<InsertShopSettings>): Promise<ShopSettings> {
    if (!this.shopSettings) {
      throw new Error("Shop settings not found");
    }
    
    this.shopSettings = {
      ...this.shopSettings,
      ...updateData,
      updatedAt: new Date(),
    };
    return this.shopSettings;
  }

  async getSalesAnalytics(period: 'daily' | 'weekly' | 'monthly'): Promise<SalesAnalytics> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const transactions = await this.getTransactionsByDateRange(startDate, now);
    const products = await this.getProducts();
    
    const dailySales = transactions
      .filter(t => {
        const transactionDate = new Date(t.createdAt!);
        return transactionDate.toDateString() === now.toDateString();
      })
      .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);

    const itemsSold = transactions.reduce((sum, t) => {
      const items = t.items as any[];
      return sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0);
    }, 0);

    const lowStockItems = products.filter(p => (p.stock || 0) < (p.minStock || 5)).length;

    // Calculate profit margin (simplified)
    const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    const totalCost = transactions.reduce((sum, t) => {
      const items = t.items as any[];
      return sum + items.reduce((itemSum, item) => {
        const product = products.find(p => p.id === item.productId);
        return itemSum + (parseFloat(product?.costPrice || "0") * item.quantity);
      }, 0);
    }, 0);
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    // Top categories
    const categoryStats = new Map<string, number>();
    transactions.forEach(t => {
      const items = t.items as any[];
      items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const current = categoryStats.get(product.category) || 0;
          categoryStats.set(product.category, current + (item.price * item.quantity));
        }
      });
    });

    const topCategories = Array.from(categoryStats.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Top products
    const productStats = new Map<string, { name: string; quantity: number }>();
    transactions.forEach(t => {
      const items = t.items as any[];
      items.forEach(item => {
        const current = productStats.get(item.productId) || { name: item.name, quantity: 0 };
        productStats.set(item.productId, { 
          name: item.name, 
          quantity: current.quantity + item.quantity 
        });
      });
    });

    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Sales trend (last 7 days)
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.createdAt!);
        return transactionDate.toDateString() === date.toDateString();
      });
      const amount = dayTransactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
      salesTrend.push({
        date: date.toISOString().split('T')[0],
        amount,
      });
    }

    return {
      dailySales,
      itemsSold,
      lowStockItems,
      profitMargin,
      topCategories,
      topProducts,
      salesTrend,
    };
  }

  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    const products = await this.getProducts();
    const now = new Date();
    
    const alerts: InventoryAlert[] = [];

    // Low stock items
    const lowStockProducts = products.filter(p => (p.stock || 0) < (p.minStock || 5) && (p.stock || 0) > 0);
    if (lowStockProducts.length > 0) {
      alerts.push({
        type: 'low_stock',
        products: lowStockProducts.map(p => ({
          id: p.id,
          name: p.name,
          currentStock: p.stock || 0,
        })),
      });
    }

    // Out of stock items
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);
    if (outOfStockProducts.length > 0) {
      alerts.push({
        type: 'out_of_stock',
        products: outOfStockProducts.map(p => ({
          id: p.id,
          name: p.name,
          currentStock: 0,
        })),
      });
    }

    // Expiring soon items (within 7 days)
    const expiringSoonProducts = products.filter(p => {
      if (!p.expiryDate) return false;
      const daysToExpiry = Math.ceil((new Date(p.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysToExpiry <= 7 && daysToExpiry > 0;
    });
    
    if (expiringSoonProducts.length > 0) {
      alerts.push({
        type: 'expiring_soon',
        products: expiringSoonProducts.map(p => ({
          id: p.id,
          name: p.name,
          currentStock: p.stock || 0,
          daysToExpiry: Math.ceil((new Date(p.expiryDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        })),
      });
    }

    return alerts;
  }
}

export const storage = new MemStorage();
