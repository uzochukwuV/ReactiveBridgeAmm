import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAddress, formatChainId } from "@/lib/chainConfig";
import CrossChainTimeline from "@/components/CrossChainTimeline";
import { Order, CrossChainEvent } from "@shared/bridgeSchema";
import { ArrowLeft, Copy, Download, Share2 } from "lucide-react";

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:id");
  const orderId = params?.id || "1234";

  const mockOrder: Order = {
    orderId,
    originChain: 64165,
    destinationChain: 84532,
    orderer: "0x1234567890123456789012345678901234567890",
    tokenDeposited: "0x0000000000000000000000000000000000000000",
    tokenRequested: "0x1234567890123456789012345678901234567890",
    amountDeposited: "1000000000000000000",
    amountRequested: "2000000000",
    amountDepositedRemaining: "1000000000000000000",
    amountRequestedRemaining: "1000000000",
    minFillAmount: "100000000",
    duration: 3600,
    slippage: 50,
    usePriceFeed: true,
    premiumBps: 200,
    protocolFeeBps: 30,
    timestamp: Math.floor(Date.now() / 1000) - 300,
    status: "active",
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  };

  const mockEvents: CrossChainEvent[] = [
    {
      step: 1,
      name: "Order Placed",
      chain: 64165,
      txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      timestamp: Math.floor(Date.now() / 1000) - 600,
      status: "completed",
      gasUsed: 125000,
    },
    {
      step: 2,
      name: "Reactive Processing",
      chain: "reactive",
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      timestamp: Math.floor(Date.now() / 1000) - 580,
      status: "completed",
      gasUsed: 47429,
    },
    {
      step: 3,
      name: "Order Received",
      chain: 84532,
      txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
      timestamp: Math.floor(Date.now() / 1000) - 560,
      status: "completed",
      gasUsed: 98000,
    },
    {
      step: 4,
      name: "Market Maker Fill",
      chain: 84532,
      txHash: "",
      timestamp: 0,
      status: "pending",
    },
  ];

  const statusColors = {
    active: "bg-status-active/20 text-status-active border-status-active/30",
    filled: "bg-status-filled/20 text-status-filled border-status-filled/30",
    cancelled: "bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30",
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
                <Badge className={`${statusColors[mockOrder.status]} border`} data-testid="badge-order-status">
                  {mockOrder.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {new Date(mockOrder.timestamp * 1000).toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => console.log("Copy order details")}
                data-testid="button-copy"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => console.log("Share order")}
                data-testid="button-share"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => console.log("Export JSON")}
                data-testid="button-export"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CrossChainTimeline events={mockEvents} />

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 uppercase tracking-wide">
              ORDER DETAILS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">ORDERER</div>
                <div className="font-mono text-sm" data-testid="text-orderer">
                  {formatAddress(mockOrder.orderer)}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">ORDER ID</div>
                <div className="font-mono text-sm" data-testid="text-order-id">
                  {mockOrder.orderId}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">ORIGIN CHAIN</div>
                <div className="font-mono text-sm">{formatChainId(mockOrder.originChain)}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">DESTINATION CHAIN</div>
                <div className="font-mono text-sm">{formatChainId(mockOrder.destinationChain)}</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">DEPOSITED</div>
                <div className="font-mono text-sm">
                  {parseFloat(mockOrder.amountDeposited) / 1e18} ETH
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">REQUESTED</div>
                <div className="font-mono text-sm">
                  {parseFloat(mockOrder.amountRequested) / 1e6} USDC
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">PREMIUM</div>
                <div className="font-mono text-sm text-primary">
                  {mockOrder.premiumBps / 100}%
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">SLIPPAGE</div>
                <div className="font-mono text-sm">{mockOrder.slippage / 100}%</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">MIN FILL</div>
                <div className="font-mono text-sm">
                  {parseFloat(mockOrder.minFillAmount) / 1e6} USDC
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">DURATION</div>
                <div className="font-mono text-sm">{mockOrder.duration}s</div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">PRICE FEED</div>
                <div className="font-mono text-sm">
                  {mockOrder.usePriceFeed ? "ENABLED" : "DISABLED"}
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground uppercase mb-1">PROTOCOL FEE</div>
                <div className="font-mono text-sm">{mockOrder.protocolFeeBps / 100}%</div>
              </div>
            </div>
          </Card>

          {mockOrder.status === "active" && (
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => console.log("Cancel order")}
                data-testid="button-cancel-order"
              >
                CANCEL ORDER
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
