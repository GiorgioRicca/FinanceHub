import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";

import Investments from "@/pages/investments";
import InvestmentMarketplace from "@/pages/investment-marketplace";
import Loans from "@/pages/loans";
import Transactions from "@/pages/transactions";
import LoanWorkflow from "@/pages/loan-workflow";
import InvestmentWorkflow from "@/pages/investment-workflow";
import YourRequests from "@/pages/your-requests";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";

/**
 * Componente Router principale che gestisce la navigazione dell'applicazione.
 * Implementa routing con wouter e layout responsive con sidebar e header mobile.
 * Configura tutte le rotte dell'applicazione con supporto multilingua.
 */
function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Responsive Sidebar - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      <main className="flex-1 overflow-y-auto w-full flex flex-col">
        {/* Mobile Header */}
        <MobileHeader />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />

          <Route path="/investments" component={Investments} />
          <Route path="/investimenti" component={Investments} />
          <Route path="/investment-marketplace" component={InvestmentMarketplace} />
          <Route path="/mercato-asset" component={InvestmentMarketplace} />
          <Route path="/loans" component={Loans} />
          <Route path="/prestiti" component={Loans} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/transazioni" component={Transactions} />
          <Route path="/loan-workflow" component={LoanWorkflow} />
          <Route path="/richiesta-prestito" component={LoanWorkflow} />
          <Route path="/investment-workflow" component={InvestmentWorkflow} />
          <Route path="/simulatore-investimenti" component={InvestmentWorkflow} />
          <Route path="/your-requests" component={YourRequests} />
          <Route path="/le-tue-richieste" component={YourRequests} />
          <Route path="/settings" component={Settings} />
          <Route path="/impostazioni" component={Settings} />
          <Route component={NotFound} />
        </Switch>
        </div>
      </main>
    </div>
  );
}

/**
 * Componente App principale che configura i provider globali.
 * Inizializza React Query, TooltipProvider e gestisce il routing.
 * Fornisce il contesto per tutta l'applicazione FinanceHub.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
