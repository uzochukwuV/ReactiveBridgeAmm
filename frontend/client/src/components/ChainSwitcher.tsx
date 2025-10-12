import { Button } from "@/components/ui/button";
import { SUPPORTED_CHAINS } from "@/lib/chainConfig";
import { useBridgeState } from "@/hooks/useAppState";
import { ArrowLeftRight } from "lucide-react";

interface ChainSwitcherProps {
  fromChain?: number;
  toChain?: number;
  onSwitch?: () => void;
}

export default function ChainSwitcher({ fromChain: propFromChain, toChain: propToChain, onSwitch: propOnSwitch }: ChainSwitcherProps) {
  const { 
    fromChain: stateFromChain, 
    toChain: stateToChain, 
    switchChains,
    fromChainConfig,
    toChainConfig,
    fromContractAddress,
    toContractAddress
  } = useBridgeState();
  
  // Use props if provided, otherwise use global state
  const fromChain = propFromChain ?? stateFromChain;
  const toChain = propToChain ?? stateToChain;
  const onSwitch = propOnSwitch ?? switchChains;
  
  const fromConfig = propFromChain ? SUPPORTED_CHAINS[propFromChain] : fromChainConfig;
  const toConfig = propToChain ? SUPPORTED_CHAINS[propToChain] : toChainConfig;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 p-4 rounded-lg border border-border bg-card">
        <div className="text-xs text-muted-foreground uppercase mb-2">FROM</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{fromConfig?.icon || "◆"}</span>
          <div>
            <div className="font-medium">{fromConfig?.name}</div>
            <div className="text-xs text-muted-foreground">{fromConfig?.nativeCurrency.symbol}</div>
            {!propFromChain && fromContractAddress && (
              <div className="text-xs text-muted-foreground mt-1" title={fromContractAddress}>
                Contract: {fromContractAddress.slice(0, 6)}...{fromContractAddress.slice(-4)}
              </div>
            )}
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onSwitch}
        className="shrink-0"
        data-testid="button-switch-chains"
      >
        <ArrowLeftRight className="h-4 w-4" />
      </Button>

      <div className="flex-1 p-4 rounded-lg border border-border bg-card">
        <div className="text-xs text-muted-foreground uppercase mb-2">TO</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{toConfig?.icon || "●"}</span>
          <div>
            <div className="font-medium">{toConfig?.name}</div>
            <div className="text-xs text-muted-foreground">{toConfig?.nativeCurrency.symbol}</div>
            {!propToChain && toContractAddress && (
              <div className="text-xs text-muted-foreground mt-1" title={toContractAddress}>
                Contract: {toContractAddress.slice(0, 6)}...{toContractAddress.slice(-4)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
