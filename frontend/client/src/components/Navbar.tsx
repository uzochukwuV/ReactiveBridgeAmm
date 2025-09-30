import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAddress, SUPPORTED_CHAINS } from "@/lib/chainConfig";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

export default function Navbar() {
  const [location] = useLocation();
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();

  const connectWallet = () => {
    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSwitchChain = (chainId: number) => {
    switchChain({ chainId });
  };

  const currentChainId = chain?.id || 64165;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/bridge">
            <div className="flex items-center gap-2 hover-elevate px-3 py-2 rounded-md cursor-pointer" data-testid="link-logo">
              <span className="text-primary text-lg">▲</span>
              <span className="font-bold text-lg tracking-tight">REACTIVEPOWBRIDGE</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/bridge">
              <div
                className={`px-4 py-2 text-sm font-medium rounded-md hover-elevate cursor-pointer ${
                  location === "/bridge"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
                data-testid="link-bridge"
              >
                BRIDGE
              </div>
            </Link>
            <Link href="/orders">
              <div
                className={`px-4 py-2 text-sm font-medium rounded-md hover-elevate cursor-pointer ${
                  location === "/orders"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
                data-testid="link-orders"
              >
                ORDERS
              </div>
            </Link>
            <Link href="/market-maker">
              <div
                className={`px-4 py-2 text-sm font-medium rounded-md hover-elevate cursor-pointer ${
                  location === "/market-maker"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
                data-testid="link-market-maker"
              >
                MARKET MAKER
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    data-testid="button-chain-switcher"
                  >
                    <span>{SUPPORTED_CHAINS[currentChainId]?.icon || "◆"}</span>
                    <span className="hidden sm:inline">
                      {SUPPORTED_CHAINS[currentChainId]?.name || chain?.name || "Unknown"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {Object.values(SUPPORTED_CHAINS).map((supportedChain) => (
                    <DropdownMenuItem
                      key={supportedChain.id}
                      onClick={() => handleSwitchChain(supportedChain.id)}
                      className="gap-2"
                      data-testid={`menu-item-chain-${supportedChain.id}`}
                    >
                      <span>{supportedChain.icon}</span>
                      <span>{supportedChain.name}</span>
                      {currentChainId === supportedChain.id && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isConnected && address ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="gap-2" data-testid="button-wallet-connected">
                    <span>{formatAddress(address)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(address)}
                    data-testid="menu-item-copy-address"
                  >
                    COPY ADDRESS
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const explorer = SUPPORTED_CHAINS[currentChainId]?.explorer || chain?.blockExplorers?.default.url;
                      if (explorer) {
                        window.open(`${explorer}/address/${address}`, "_blank");
                      }
                    }}
                    data-testid="menu-item-view-explorer"
                  >
                    VIEW ON EXPLORER
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDisconnect}
                    className="text-destructive"
                    data-testid="menu-item-disconnect"
                  >
                    DISCONNECT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={connectWallet} size="sm" data-testid="button-connect-wallet">
                CONNECT WALLET
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
