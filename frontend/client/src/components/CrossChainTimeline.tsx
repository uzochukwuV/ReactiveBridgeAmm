import { Card } from "@/components/ui/card";
import { CrossChainEvent } from "@shared/bridgeSchema";
import { formatAddress, formatChainId, REACTIVE_NETWORK } from "@/lib/chainConfig";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";

interface CrossChainTimelineProps {
  events: CrossChainEvent[];
}

export default function CrossChainTimeline({ events }: CrossChainTimelineProps) {
  const getStatusIcon = (status: CrossChainEvent["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-status-active" />;
      case "pending":
        return <Loader2 className="h-5 w-5 text-status-pending animate-spin" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-status-cancelled" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const getChainName = (chain: number | string) => {
    if (typeof chain === "string") return REACTIVE_NETWORK.name;
    return formatChainId(chain);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6 uppercase tracking-wide">
        CROSS-CHAIN TRANSACTION FLOW
      </h3>
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="relative">
            {index < events.length - 1 && (
              <div className="absolute left-[10px] top-8 bottom-0 w-0.5 bg-border" />
            )}
            <div className="flex gap-4">
              <div className="shrink-0 mt-1">{getStatusIcon(event.status)}</div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {getChainName(event.chain)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <div>STEP {event.step}</div>
                    {event.timestamp > 0 && (
                      <div className="mt-1">{formatTimestamp(event.timestamp)}</div>
                    )}
                  </div>
                </div>
                {event.txHash && (
                  <div className="mt-2 p-3 rounded-md bg-muted/50 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">TX HASH</div>
                    <div className="font-mono text-sm" data-testid="text-tx-hash">
                      {formatAddress(event.txHash)}
                    </div>
                    {event.gasUsed && (
                      <div className="text-xs text-muted-foreground mt-2">
                        GAS USED: {event.gasUsed.toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
