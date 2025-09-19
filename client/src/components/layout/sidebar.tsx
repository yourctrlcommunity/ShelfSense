import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Store, 
  BarChart3, 
  Scan, 
  CreditCard, 
  Package, 
  TrendingUp, 
  FileText, 
  Bot, 
  Settings,
  Wifi,
  WifiOff
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Barcode Scanner", href: "/scanner", icon: Scan },
  { name: "Billing", href: "/billing", icon: CreditCard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "AI Assistant", href: "/assistant", icon: Bot },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const isOffline = false; // TODO: Implement offline detection

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  });

  return (
    <aside className="w-64 bg-card border-r border-border shadow-lg">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <Store className="text-primary text-2xl" />
          <div>
            <h1 className="text-lg font-bold text-foreground">ShopSmart</h1>
            <p className="text-xs text-muted-foreground">Smart Assistant</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={cn(
                "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
              )}>
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-secondary p-3 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2 text-sm">
            {isOffline ? (
              <>
                <WifiOff className="w-4 h-4 text-destructive" />
                <span className="text-muted-foreground">Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">Online</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {settings?.shopName || "Loading..."}
          </p>
          <p className="text-xs text-muted-foreground">
            Last sync: 2 min ago
          </p>
        </div>
      </div>
    </aside>
  );
}
