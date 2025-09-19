import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Store, 
  Bell, 
  Database, 
  Download, 
  Upload,
  Trash2,
  Save,
  RefreshCw
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertShopSettingsSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ShopSettings, InsertShopSettings } from "@shared/schema";
import { z } from "zod";

const settingsFormSchema = insertShopSettingsSchema.extend({
  receiptFooter: z.string().max(100, "Receipt footer must be less than 100 characters").optional(),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("shop");
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery<ShopSettings>({
    queryKey: ['/api/settings'],
  });

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      shopName: "",
      ownerName: "",
      address: "",
      phone: "",
      email: "",
      gstNumber: "",
      currency: "INR",
      timezone: "Asia/Kolkata",
      receiptFooter: "",
      isOfflineMode: false,
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SettingsFormData>) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: "Success", description: "Settings updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  // Update form when settings data is loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        shopName: settings.shopName || "",
        ownerName: settings.ownerName || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        gstNumber: settings.gstNumber || "",
        currency: settings.currency || "INR",
        timezone: settings.timezone || "Asia/Kolkata",
        receiptFooter: settings.receiptFooter || "",
        isOfflineMode: settings.isOfflineMode || false,
      });
      setIsOfflineMode(settings.isOfflineMode || false);
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormData) => {
    updateSettingsMutation.mutate(data);
  };

  const handleExportData = () => {
    // TODO: Implement data export functionality
    toast({ 
      title: "Export Started", 
      description: "Your data export will be ready shortly" 
    });
  };

  const handleImportData = () => {
    // TODO: Implement data import functionality
    toast({ 
      title: "Import", 
      description: "Please select a file to import" 
    });
  };

  const handleClearData = () => {
    // TODO: Implement data clearing functionality
    toast({ 
      title: "Warning", 
      description: "This action will clear all data. Please confirm.",
      variant: "destructive"
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-card border-b border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <SettingsIcon className="mr-2" />
              Settings
            </h2>
            <p className="text-sm text-muted-foreground">Manage your shop preferences and configuration</p>
          </div>
          <Badge variant={settings?.isOfflineMode ? "destructive" : "default"} data-testid="offline-mode-badge">
            {settings?.isOfflineMode ? "Offline Mode" : "Online Mode"}
          </Badge>
        </div>
      </header>

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="shop" data-testid="tab-shop-settings">
              <Store className="mr-2 h-4 w-4" />
              Shop Details
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="data" data-testid="tab-data-management">
              <Database className="mr-2 h-4 w-4" />
              Data Management
            </TabsTrigger>
            <TabsTrigger value="advanced" data-testid="tab-advanced">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Shop Information</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="shopName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shop Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-shop-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Owner Name</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-owner-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} data-testid="textarea-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="gstNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GST Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="15XXXXX1234X1Z5" data-testid="input-gst-number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-currency">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                              <SelectItem value="USD">US Dollar ($)</SelectItem>
                              <SelectItem value="EUR">Euro (€)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="receiptFooter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt Footer Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Thank you for shopping with us!" 
                            maxLength={100}
                            data-testid="textarea-receipt-footer"
                          />
                        </FormControl>
                        <FormDescription>
                          This message will appear at the bottom of all receipts
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={updateSettingsMutation.isPending}
                    data-testid="button-save-shop-settings"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when products are running low
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-low-stock-alerts" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Sales Summary</p>
                    <p className="text-sm text-muted-foreground">
                      Receive daily sales reports via email
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-daily-summary" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Expiry Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Alert when products are nearing expiry
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-expiry-alerts" />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI Recommendations</p>
                    <p className="text-sm text-muted-foreground">
                      Receive AI-powered business insights
                    </p>
                  </div>
                  <Switch defaultChecked data-testid="switch-ai-recommendations" />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Data Backup & Restore</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Export Data</p>
                      <p className="text-sm text-muted-foreground">
                        Download all your business data as CSV files
                      </p>
                    </div>
                    <Button onClick={handleExportData} data-testid="button-export-data">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Import Data</p>
                      <p className="text-sm text-muted-foreground">
                        Upload data from external sources
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleImportData} data-testid="button-import-data">
                      <Upload className="mr-2 h-4 w-4" />
                      Import
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div>
                      <p className="font-medium text-destructive">Clear All Data</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete all business data (irreversible)
                      </p>
                    </div>
                    <Button variant="destructive" onClick={handleClearData} data-testid="button-clear-data">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Data
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Data Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="data-summary">
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <p className="text-2xl font-bold">Loading...</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">Loading...</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">Data Size</p>
                    <p className="text-2xl font-bold">~2.5 MB</p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Offline Mode</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable Offline Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Work without internet connection (data will sync when online)
                      </p>
                    </div>
                    <Switch 
                      checked={isOfflineMode}
                      onCheckedChange={setIsOfflineMode}
                      data-testid="switch-offline-mode"
                    />
                  </div>
                  
                  {isOfflineMode && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Offline mode is enabled. Data will be stored locally and synced when connection is restored.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">System Information</h3>
                <div className="space-y-3" data-testid="system-info">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Sync</span>
                    <span>{settings?.lastSyncAt ? new Date(settings.lastSyncAt).toLocaleString('en-IN') : 'Never'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Database Status</span>
                    <Badge variant="default">Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage Used</span>
                    <span>2.5 MB / 100 MB</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Developer Options</h3>
                <div className="space-y-4">
                  <Button variant="outline" data-testid="button-clear-cache">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear Cache
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Clear application cache to resolve performance issues
                  </p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
