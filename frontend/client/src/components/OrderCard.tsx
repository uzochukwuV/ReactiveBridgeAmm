import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAddress, formatChainId } from "@/lib/chainConfig";
import { Order } from "@shared/bridgeSchema";
import { Link } from "wouter";

interface OrderCardProps {
  order: Order;
  onCancel?: (orderId: string) => void;
}

export default function OrderCard({ order, onCancel }: OrderCardProps) {
  const statusColors = {
    active: "bg-status-active/20 text-status-active border-status-active/30",
    filled: "bg-status-filled/20 text-status-filled border-status-filled/30",
    cancelled: "bg-status-cancelled/20 text-status-cancelled border-status-cancelled/30",
    pending: "bg-status-pending/20 text-status-pending border-status-pending/30",
  };

  const fillProgress = order.amountRequestedRemaining
    ? ((BigInt(order.amountRequested) - BigInt(order.amountRequestedRemaining)) * BigInt(100)) /
      BigInt(order.amountRequested)
    : BigInt(0);

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000 - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Card className="p-6 hover-elevate" data-testid={`card-order-${order.orderId}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-lg font-bold" data-testid="text-order-id">
              #{order.orderId}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {timeAgo(order.timestamp)}
            </div>
          </div>
          <Badge className={`${statusColors[order.status]} border`} data-testid="badge-order-status">
            {order.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">FROM</span>
            <span className="font-mono">{formatChainId(order.originChain)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">TO</span>
            <span className="font-mono">{formatChainId(order.destinationChain)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">DEPOSIT</span>
            <span className="font-mono">{parseFloat(order.amountDeposited) / 1e18} ETH</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">REQUEST</span>
            <span className="font-mono">{parseFloat(order.amountRequested) / 1e18} USDC</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">PREMIUM</span>
            <span className="font-mono text-primary">{order.premiumBps / 100}%</span>
          </div>
        </div>

        {order.status === "active" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>FILL PROGRESS</span>
              <span>{fillProgress.toString()}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${fillProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Link href={`/orders/${order.orderId}`}>
            <Button variant="outline" size="sm" className="flex-1" data-testid="button-view-details">
              VIEW DETAILS
            </Button>
          </Link>
          {order.status === "active" && onCancel && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => onCancel(order.orderId)}
              data-testid="button-cancel-order"
            >
              CANCEL
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
