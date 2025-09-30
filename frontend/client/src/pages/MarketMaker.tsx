import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatAddress, formatChainId } from "@/lib/chainConfig";
import { Order } from "@shared/bridgeSchema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MarketMaker() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [fillAmount, setFillAmount] = useState("");

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
      amountRequestedRemaining: "2000000000",
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
      orderId: "1235",
      originChain: 84532,
      destinationChain: 64165,
      orderer: "0x1234567890123456789012345678901234567890",
      tokenDeposited: "0x1234567890123456789012345678901234567890",
      tokenRequested: "0x0000000000000000000000000000000000000000",
      amountDeposited: "1500000000",
      amountRequested: "750000000000000000",
      amountDepositedRemaining: "1500000000",
      amountRequestedRemaining: "750000000000000000",
      minFillAmount: "50000000000000000",
      duration: 3600,
      slippage: 50,
      usePriceFeed: true,
      premiumBps: 150,
      protocolFeeBps: 30,
      timestamp: Math.floor(Date.now() / 1000) - 600,
      status: "active",
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
  ];

  const calculateProfit = (order: Order, amount: string) => {
    if (!amount) return "0.00";
    const premiumAmount = (parseFloat(amount) * order.premiumBps) / 10000;
    return premiumAmount.toFixed(4);
  };

  const handleFillOrder = () => {
    if (!selectedOrder) return;
    console.log("Fill order:", {
      orderId: selectedOrder.orderId,
      fillAmount,
    });
    setSelectedOrder(null);
    setFillAmount("");
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            MARKET MAKER INTERFACE
          </h1>
          <p className="text-muted-foreground">
            Fill active orders and earn premiums
          </p>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
          <TabsList>
            <TabsTrigger value="available" data-testid="tab-available">
              AVAILABLE ORDERS
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active-fills">
              MY ACTIVE FILLS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockOrders.map((order) => (
                <Card key={order.orderId} className="p-6 hover-elevate" data-testid={`card-order-${order.orderId}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-mono text-lg font-bold">#{order.orderId}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatChainId(order.originChain)} → {formatChainId(order.destinationChain)}
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30 border text-lg px-3 py-1">
                      {order.premiumBps / 100}%
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">AVAILABLE TO FILL</span>
                      <span className="font-mono">
                        {parseFloat(order.amountRequestedRemaining) / 1e6} USDC
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">MIN FILL</span>
                      <span className="font-mono">
                        {parseFloat(order.minFillAmount) / 1e6} USDC
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">POTENTIAL PROFIT</span>
                      <span className="font-mono text-primary">
                        {calculateProfit(order, order.amountRequestedRemaining)} USDC
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">SLIPPAGE</span>
                      <span className="font-mono">{order.slippage / 100}%</span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => setSelectedOrder(order)}
                        data-testid={`button-fill-${order.orderId}`}
                      >
                        FILL ORDER
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>FILL ORDER #{order.orderId}</DialogTitle>
                        <DialogDescription>
                          Provide liquidity and earn {order.premiumBps / 100}% premium
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="fillAmount">FILL AMOUNT (USDC)</Label>
                          <Input
                            id="fillAmount"
                            type="text"
                            placeholder="0.0"
                            value={fillAmount}
                            onChange={(e) => setFillAmount(e.target.value)}
                            className="font-mono"
                            data-testid="input-fill-amount"
                          />
                          <div className="text-xs text-muted-foreground">
                            MIN: {parseFloat(order.minFillAmount) / 1e6} USDC | MAX:{" "}
                            {parseFloat(order.amountRequestedRemaining) / 1e6} USDC
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">YOUR PROFIT</span>
                            <span className="font-mono text-primary">
                              {calculateProfit(order, fillAmount)} USDC
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">PROTOCOL FEE</span>
                            <span className="font-mono">
                              {fillAmount ? ((parseFloat(fillAmount) * order.protocolFeeBps) / 10000).toFixed(4) : "0.00"} USDC
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">OUTPUT</span>
                            <span className="font-mono">
                              {fillAmount ? (parseFloat(fillAmount) * 0.5).toFixed(4) : "0.00"} ETH
                            </span>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          onClick={handleFillOrder}
                          disabled={!fillAmount}
                          data-testid="button-confirm-fill"
                        >
                          CONFIRM FILL
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="active">
            <div className="flex flex-col items-center justify-center py-24">
              <div className="text-6xl mb-6 text-muted-foreground">▬▬▬</div>
              <div className="text-xl font-medium mb-2">NO ACTIVE FILLS</div>
              <p className="text-muted-foreground">
                Your filled orders will appear here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
