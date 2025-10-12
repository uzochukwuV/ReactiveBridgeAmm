import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Web3Provider from "@/components/Web3Provider";
import Navbar from "@/components/Navbar";
import Landing from "@/pages/Landing";
import Bridge from "@/pages/Bridge";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import MarketMaker from "@/pages/MarketMaker";
import NotFound from "@/pages/not-found";
import Liquidity from "./pages/Liquidity";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/bridge" component={Bridge} />
      <Route path="/orders" component={Orders} />
      <Route path="/orders/:id" component={OrderDetail} />
      <Route path="/market-maker" component={MarketMaker} />
      <Route path="/liquidity" component={Liquidity} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Web3Provider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-grid-pattern bg-grid">
            <Navbar />
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </Web3Provider>
  );
}

export default App;
