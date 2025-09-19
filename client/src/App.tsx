import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Scanner from "@/pages/scanner";
import Billing from "@/pages/billing";
import Inventory from "@/pages/inventory";
import Analytics from "@/pages/analytics";
import Reports from "@/pages/reports";
import Assistant from "@/pages/assistant";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AppRouter() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/scanner" component={Scanner} />
          <Route path="/billing" component={Billing} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/reports" component={Reports} />
          <Route path="/assistant" component={Assistant} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router base="/ShelfSense">
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
