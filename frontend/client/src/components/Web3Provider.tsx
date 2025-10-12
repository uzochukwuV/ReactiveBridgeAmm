import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmiConfig";
import AppStateProvider from "./AppStateProvider";

const queryClient = new QueryClient();

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppStateProvider>
        {children}
        </AppStateProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
