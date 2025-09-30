import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderCard from "@/components/OrderCard";
import { Order } from "@shared/bridgeSchema";
import { Search } from "lucide-react";

export default function Orders() {
  const [filter, setFilter] = useState<"all" | "active" | "filled" | "cancelled">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const mockOrders: Order[] = [
    {
      orderId: "1234",
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
    },
    {
      orderId: "1233",
      originChain: 84532,
      destinationChain: 64165,
      orderer: "0x1234567890123456789012345678901234567890",
      tokenDeposited: "0x1234567890123456789012345678901234567890",
      tokenRequested: "0x0000000000000000000000000000000000000000",
      amountDeposited: "1500000000",
      amountRequested: "750000000000000000",
      amountDepositedRemaining: "0",
      amountRequestedRemaining: "0",
      minFillAmount: "50000000000000000",
      duration: 3600,
      slippage: 50,
      usePriceFeed: true,
      premiumBps: 150,
      protocolFeeBps: 30,
      timestamp: Math.floor(Date.now() / 1000) - 3600,
      status: "filled",
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
    {
      orderId: "1232",
      originChain: 64165,
      destinationChain: 84532,
      orderer: "0x1234567890123456789012345678901234567890",
      tokenDeposited: "0x0000000000000000000000000000000000000000",
      tokenRequested: "0x1234567890123456789012345678901234567890",
      amountDeposited: "500000000000000000",
      amountRequested: "1000000000",
      amountDepositedRemaining: "500000000000000000",
      amountRequestedRemaining: "1000000000",
      minFillAmount: "100000000",
      duration: 3600,
      slippage: 50,
      usePriceFeed: true,
      premiumBps: 250,
      protocolFeeBps: 30,
      timestamp: Math.floor(Date.now() / 1000) - 7200,
      status: "cancelled",
      txHash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    },
  ];

  const filteredOrders = mockOrders.filter((order) => {
    if (filter !== "all" && order.status !== filter) return false;
    if (searchQuery && !order.orderId.includes(searchQuery)) return false;
    return true;
  });

  const handleCancelOrder = (orderId: string) => {
    console.log("Cancel order:", orderId);
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

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-6xl mb-6 text-muted-foreground">▬▬▬</div>
            <div className="text-xl font-medium mb-2">NO ORDERS FOUND</div>
            <p className="text-muted-foreground mb-6">
              {filter === "all"
                ? "Start by placing your first order"
                : `No ${filter} orders at the moment`}
            </p>
            <Button data-testid="button-place-first-order">PLACE ORDER</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.orderId} order={order} onCancel={handleCancelOrder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
