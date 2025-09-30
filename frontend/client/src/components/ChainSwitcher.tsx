import { Button } from "@/components/ui/button";
import { SUPPORTED_CHAINS } from "@/lib/chainConfig";
import { ArrowLeftRight } from "lucide-react";

interface ChainSwitcherProps {
  fromChain: number;
  toChain: number;
  onSwitch: () => void;
}

export default function ChainSwitcher({ fromChain, toChain, onSwitch }: ChainSwitcherProps) {
  const fromChainConfig = SUPPORTED_CHAINS[fromChain];
  const toChainConfig = SUPPORTED_CHAINS[toChain];

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 p-4 rounded-lg border border-border bg-card">
        <div className="text-xs text-muted-foreground uppercase mb-2">FROM</div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{fromChainConfig.icon}</span>
          <div>
            <div className="font-medium">{fromChainConfig.name}</div>
            <div className="text-xs text-muted-foreground">{fromChainConfig.nativeCurrency.symbol}</div>
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
          <span className="text-2xl">{toChainConfig.icon}</span>
          <div>
            <div className="font-medium">{toChainConfig.name}</div>
            <div className="text-xs text-muted-foreground">{toChainConfig.nativeCurrency.symbol}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
