import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderCard from "@/components/OrderCard";
import { Order } from "@shared/bridgeSchema";
import { Search, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useGetUserBids, useGetBid, useCancelBid } from "@/hooks/useL1Contract";
import { getTokenByAddress } from "@/lib/tokenConfig";
import { formatUnits } from "viem";
import { useToast } from "@/hooks/use-toast";

export default function Orders() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [filter, setFilter] = useState<"all" | "active" | "filled" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain] = useState(64165); // Default to Sonic

  // Get user's bid IDs
  const { data: userBidIds, isLoading: isLoadingBids } = useGetUserBids(selectedChain, address);

  // Cancel bid mutation
  const { cancelBid, isPending: isCancelling } = useCancelBid(selectedChain);

  // Transform contract bids to Order format
  const orders = useMemo(() => {
    if (!userBidIds ) return [];

    // Note: In production, you'd fetch full bid details for each ID
    // For now, this requires enhancing the contract or making multiple calls
    // Simplified version - you'll need to implement batch fetching
    return [];
  }, [userBidIds]);

  const filteredOrders = orders.filter((order) => {
    if (filter !== "all" && order.status !== filter) return false;
    if (searchQuery && !order.orderId.includes(searchQuery)) return false;
    return true;
  });

  const handleCancelOrder = async (orderId: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
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

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            ORDER DASHBOARD
          </h1>
          <p className="text-muted-foreground">
            Track all your cross-chain orders in real-time
          </p>
        </div>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-6xl mb-6 text-muted-foreground">⚠️</div>
            <div className="text-xl font-medium mb-2">WALLET NOT CONNECTED</div>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to view your orders
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="flex-1">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all" data-testid="tab-all">
                    ALL
                  </TabsTrigger>
                  <TabsTrigger value="active" data-testid="tab-active">
                    ACTIVE
                  </TabsTrigger>
                  <TabsTrigger value="filled" data-testid="tab-filled">
                    FILLED
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" data-testid="tab-cancelled">
                    CANCELLED
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-orders"
                />
              </div>
            </div>

            {isLoadingBids ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                <div className="text-xl font-medium mb-2">LOADING ORDERS...</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="text-6xl mb-6 text-muted-foreground">▬▬▬</div>
                <div className="text-xl font-medium mb-2">NO ORDERS FOUND</div>
                <p className="text-muted-foreground mb-6">
                  {filter === "all"
                    ? "Start by placing your first order"
                    : `No ${filter} orders at the moment`}
                </p>
                <Button data-testid="button-place-first-order" onClick={() => window.location.href = "/bridge"}>
                  PLACE ORDER
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    onCancel={handleCancelOrder}
                  />
                ))}
              </div>
            )}

            {/* Helper note for development */}
            {isConnected && userBidIds && (
              <div className="mt-8 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  <strong>Dev Note:</strong> Found {userBidIds.length} bid(s) for your address.
                  To display full details, implement batch bid fetching using the <code>useGetBid</code> hook
                  for each bid ID, or enhance the contract with a <code>getUserBidsWithDetails()</code> function.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
