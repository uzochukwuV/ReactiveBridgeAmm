import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAddress, formatChainId } from "@/lib/chainConfig";
import CrossChainTimeline from "@/components/CrossChainTimeline";
import { CrossChainEvent } from "@shared/bridgeSchema";
import { ArrowLeft, Copy, Download, Share2, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useGetBid, useGetBidFills, useCancelBid, useIsBidExpired } from "@/hooks/useL1Contract";
import { getTokenByAddress } from "@/lib/tokenConfig";
import { formatUnits } from "viem";
import { useToast } from "@/hooks/use-toast";

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id || "1";
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [selectedChain] = useState(64165); // Sonic

  // Fetch bid details
  const { data: bid, isLoading: isLoadingBid } = useGetBid(selectedChain, parseInt(orderId));

  // Fetch fills for this bid
  const { data: fills, isLoading: isLoadingFills } = useGetBidFills(selectedChain, parseInt(orderId));

  // Check if expired
  const { data: isExpired } = useIsBidExpired(selectedChain, parseInt(orderId));

  // Cancel bid mutation
  const { cancelBid, isPending: isCancelling } = useCancelBid(selectedChain);

  const handleCancelOrder = async () => {
    if (!isConnected || !bid) {
      toast({
        title: "Cannot cancel",
        description: "Wallet not connected or bid not found",
        variant: "destructive",
      });
      return;
    }

    if (bid.owner.toLowerCase() !== address?.toLowerCase()) {
      toast({
        title: "Not authorized",
        description: "You can only cancel your own orders",
        variant: "destructive",
      });
      return;
    }

    try {
      await cancelBid(parseInt(orderId));

      toast({
        title: "Order cancelled",
        description: `Order #${orderId} has been cancelled successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to cancel order",
        description: error?.message || "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleCopyDetails = () => {
    if (!bid) return;
    const details = JSON.stringify(bid, null, 2);
    navigator.clipboard.writeText(details);
    toast({ title: "Copied!", description: "Order details copied to clipboard" });
  };

  const handleExport = () => {
    if (!bid) return;
    const dataStr = JSON.stringify(bid, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `order-${orderId}.json`;
    link.click();
  };

  // Mock events for now - in production, fetch from event logs
  const mockEvents: CrossChainEvent[] = [
    {
      step: 1,
      name: "Order Placed",
      chain: selectedChain,
      txHash: "0x" + "0".repeat(64),
      timestamp: bid ? Number(bid.createdAt) : 0,
      status: "completed",
    },
  ];

  if (isLoadingBid) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4 mx-auto" />
          <div className="text-xl font-medium">LOADING ORDER...</div>
        </div>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">⚠️</div>
          <div className="text-xl font-medium mb-2">ORDER NOT FOUND</div>
          <Link href="/orders">
            <Button className="mt-4">BACK TO ORDERS</Button>
          </Link>
        </div>
      </div>
    );
  }

  const depositToken = getTokenByAddress(selectedChain, bid.tokenInfo.tokenIn);
  const requestToken = getTokenByAddress(Number(bid.destinationChain), bid.tokenInfo.l2TokenOut);

  const status = !bid.isActive
    ? "cancelled"
    : isExpired
    ? "expired"
    : Number(bid.amountRemaining) === 0
    ? "filled"
    : "active";

  const statusColors = {
    active: "bg-status-active/20 text-status-active border-status-active/30",
    filled: "bg-status-filled/20 text-status-filled border-status-filled/30",
    cancelled: "bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30",
    expired: "bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30",
    pending: "bg-status-pending/20 text-status-pending border-status-pending/30",
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="gap-2 mb-4" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
              BACK TO ORDERS
            </Button>
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-mono">
                  ORDER #{orderId}
                </h1>
                <Badge className={`${statusColors[status]} border`} data-testid="badge-order-status">
                  {status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {new Date(Number(bid.createdAt) * 1000).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyDetails}
                data-testid="button-copy"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" data-testid="button-share">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleExport} data-testid="button-export">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CrossChainTimeline events={mockEvents} />

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 uppercase tracking-wide">ORDER DETAILS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">ORDERER</div>
                <div className="font-mono text-sm" data-testid="text-orderer">
                  {formatAddress(bid.owner)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">ORDER ID</div>
                <div className="font-mono text-sm" data-testid="text-order-id">
                  {orderId}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">ORIGIN CHAIN</div>
                <div className="font-mono text-sm">{formatChainId(selectedChain)}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">DESTINATION CHAIN</div>
                <div className="font-mono text-sm">{formatChainId(Number(bid.destinationChain))}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">DEPOSITED</div>
                <div className="font-mono text-sm">
                  {depositToken
                    ? formatUnits(bid.tokenInfo.tokenInAmount, depositToken.decimals)
                    : "0"}{" "}
                  {depositToken?.symbol || "TOKEN"}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">REMAINING</div>
                <div className="font-mono text-sm">
                  {depositToken ? formatUnits(bid.amountRemaining, depositToken.decimals) : "0"}{" "}
                  {depositToken?.symbol || "TOKEN"}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">PREMIUM</div>
                <div className="font-mono text-sm text-primary">
                  {Number(bid.bidInfo.percentagePriceFeed) / 100}%
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">SLIPPAGE</div>
                <div className="font-mono text-sm">{Number(bid.bidInfo.slippage) / 100}%</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">MIN FILL</div>
                <div className="font-mono text-sm">
                  {requestToken
                    ? formatUnits(bid.bidInfo.minFillAmount, requestToken.decimals)
                    : "0"}{" "}
                  {requestToken?.symbol || "TOKEN"}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">EXPIRES</div>
                <div className="font-mono text-sm">
                  {new Date(Number(bid.expiresAt) * 1000).toLocaleString()}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">FILLS</div>
                <div className="font-mono text-sm">{fills?.length || 0}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">RECEIVER</div>
                <div className="font-mono text-sm">{formatAddress(bid.bidInfo.reciever)}</div>
              </div>
            </div>
          </Card>

          {status === "active" && bid.owner.toLowerCase() === address?.toLowerCase() && (
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                data-testid="button-cancel-order"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    CANCELLING...
                  </>
                ) : (
                  "CANCEL ORDER"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
