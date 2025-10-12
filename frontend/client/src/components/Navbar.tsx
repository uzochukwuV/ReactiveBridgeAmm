import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAddress } from "@/lib/chainConfig";
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { useNetworkState, useBridgeState } from "@/hooks/useAppState";
import { useEffect } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const { address, isConnected, chain } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { networkType, setNetworkType, availableChains, isTestnet } = useNetworkState();
  const { setFromChain, fromChain } = useBridgeState();

  // Auto-switch wallet chain when network type changes
  useEffect(() => {
    if (isConnected && Object.keys(availableChains).length > 0) {
      const chainIds = Object.keys(availableChains).map(Number);
      const defaultChain = chainIds[0];
      
      if (defaultChain && chain?.id !== defaultChain) {
        switchChain({ chainId: defaultChain });
        setFromChain(defaultChain);
      }
    }
  }, [networkType]); // Only depend on networkType to avoid loops

  const connectWallet = () => {
    const injectedConnector = connectors.find((c) => c.id === "metaMask");
    console.log(connectors)
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSwitchChain = (chainId: number) => {
    // Update both wallet and app state
    switchChain({ chainId });
    setFromChain(chainId);
    // setNetworkType ? 'testnet' : 'mainnet')
    console.log(availableChains)
  };

  const handleSwtitchNwtwork = (_networkType: string) => {
    setNetworkType(_networkType);
    switchChain({ chainId: Object.keys(availableChains)[0]});
    setFromChain(Object.keys(availableChains)[0]);
  }

  const currentChainId = fromChain;

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
            <Link href="/liquidity">
              <div
                className={`px-4 py-2 text-sm font-medium rounded-md hover-elevate cursor-pointer ${
                  location === "/liquidity"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
                data-testid="link-liquidity"
              >
                LIQUIDITY
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
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={networkType === 'testnet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  handleSwtitchNwtwork('testnet');
                }}
                className="h-7 px-2 text-xs"
              >
                Testnet
              </Button>
              <Button
                variant={networkType === 'mainnet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  handleSwtitchNwtwork('mainnet');
                }}
                className="h-7 px-2 text-xs"
              >
                Mainnet
              </Button>
            </div>
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    data-testid="button-chain-switcher"
                  >
                    <span>{availableChains[currentChainId]?.icon || "◆"}</span>
                    <span className="hidden sm:inline">
                      {availableChains[currentChainId]?.name || chain?.name || "Unknown"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {Object.values(availableChains).map((supportedChain) => (
                    <DropdownMenuItem
                      key={supportedChain.id}
                      onClick={() => handleSwitchChain(supportedChain.id)}
                      className="gap-2"
                      data-testid={`menu-item-chain-${supportedChain.id}`}
                    >
                      <span>{supportedChain.icon}</span>
                      <span>{supportedChain.name}</span>
                      {chain?.id === supportedChain.id && (
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
                      const explorer = availableChains[currentChainId]?.explorer || chain?.blockExplorers?.default.url;
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
