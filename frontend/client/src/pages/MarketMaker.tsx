import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatChainId } from "@/lib/chainConfig";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAccount } from "wagmi";
import { useApproveToken, useGetActiveBids, useGetAmountOut } from "@/hooks/useL1Contract";
import {useCreateL2Order, useGetUserFillOrder} from "@/hooks/useL2Fill"
import { formatTokenAmount, getTokenByAddress } from "@/lib/tokenConfig";
import { formatEther, formatUnits, parseEther } from "viem";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { CrossChainBid } from "@/types";
import { useReactiveListener } from "@/hooks/useReactiveListener";
import { ReactiveTransaction } from "@/lib/reactiveRpc";
import { REACTIVE_CONTRACT_ADDRESS } from "@/lib/networkConfig";

export default function MarketMaker() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const [selectedBid, setSelectedBid] = useState<CrossChainBid | null>(null);
  const [fillAmount, setFillAmount] = useState("");
  const [fillRemaining, setFillRemaining] = useState(false);
  const [selectedChain] = useState(11155111); // Base Sepolia - destination chain
  const [orderCreatedTimestamp, setOrderCreatedTimestamp] = useState<number | null>(null);


  const {approve, } = useApproveToken(selectedChain)

  // Fetch active bids from origin chain
  const { data: bidsData, isLoading: isLoadingBids } = useGetActiveBids(selectedChain, 0, 20);
  const activeBids : CrossChainBid[] = bidsData?.[0] || [];

  // Fetch user's fills
  const { data: userFillIds } = useGetUserFillOrder(selectedChain, address);

  // Fill order mutation
  const { createL2Order, isPending: isFilling } = useCreateL2Order(selectedChain);

  // Reactive network listener
  const { isListening, stopListening } = useReactiveListener({
    rvmId: "0x1", // Update with correct RVM ID
    startTimestamp: orderCreatedTimestamp || 0,
    onTransaction: (tx: ReactiveTransaction) => {
      console.log('Reactive transaction detected:', tx);
      
      // Check if this transaction is related to our order
      if (tx.to === REACTIVE_CONTRACT_ADDRESS) {
        console.log('Order-related reactive transaction:', {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          refChainId: tx.refChainId,
          data: tx.data
        });
      }
    },
    enabled: !!orderCreatedTimestamp
  });


  const {  isLoading: isLoadingAmountOut, data: amountOut} = useGetAmountOut(
      selectedBid?.l1_ChainId,
      selectedBid?.tokenInfo.l2_TokenCorrespondingL1Address,
      selectedBid?.tokenInfo.l1_TokenAddress,
      BigInt(Number(selectedBid?.amountRemaining || 0))
  );


  useEffect(() => {
    console.log("amount from user", amountOut)
  }, [bidsData, isLoadingBids])

  const calculateProfit = (premiumBps: number, amount: string) => {
    if (!amount) return "0.00";
    const premiumAmount = (parseFloat(amount) * premiumBps) / 10000;
    return premiumAmount.toFixed(4);
  };

  const handleFillOrder = async () => {
    if (!selectedBid || !fillAmount || !isConnected || !address) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(selectedBid, selectedChain)
      const token = getTokenByAddress(selectedChain, selectedBid.tokenInfo.l2_TokenAddress);

      if (!token) {
        throw new Error("Token not found");
      }

      let amount =  Number(fillAmount) * 10 ** token?.decimals!;

      console.log(
        [amount, selectedBid, address]
      )

       const tx = await approve(
        token.address,
        BigInt(amount),
      )

      console.log({
        l1BidId: Number(selectedBid.l1_BidId),
        l1ChainId: Number(selectedBid.l1_ChainId),
        l2TokenIn: selectedBid.tokenInfo.l2_TokenAddress,
        l2TokenAmountIn: amount.toString(),
        receiverL1Address: address,
        fillRemaining,
        tokenDecimals: token.decimals,
      })
      await createL2Order({
        l1BidId: Number(selectedBid.l1_BidId),
        l1ChainId: Number(selectedBid.l1_ChainId),
        l2TokenIn: selectedBid.tokenInfo.l2_TokenAddress,
        l2TokenAmountIn: amount.toString(),
        receiverL1Address: address,
        fillRemaining,
        tokenDecimals: token.decimals,
      });

      // Set timestamp to start listening for reactive transactions
      setOrderCreatedTimestamp(Date.now());

      toast({
        title: "Order filled successfully!",
        description: `You've filled order #${selectedBid.l1_BidId}. Monitoring reactive network...`,
      });

      setSelectedBid(null);
      setFillAmount("");
      setFillRemaining(false);
    } catch (error: any) {
      toast({
        title: "Failed to fill order",
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
            MARKET MAKER INTERFACE
          </h1>
          <p className="text-muted-foreground">
            Fill active orders and earn premiums
          </p>
        </div>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-6xl mb-6 text-muted-foreground">⚠️</div>
            <div className="text-xl font-medium mb-2">WALLET NOT CONNECTED</div>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to fill orders
            </p>
          </div>
        ) : (
          <Tabs defaultValue="available" className="space-y-6">
            <TabsList>
              <TabsTrigger value="available" data-testid="tab-available">
                AVAILABLE ORDERS
              </TabsTrigger>
              <TabsTrigger value="active" data-testid="tab-active-fills">
                MY ACTIVE FILLS ({userFillIds?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-6">
              {isLoadingBids ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
                  <div className="text-xl font-medium mb-2">LOADING ORDERS...</div>
                </div>
              ) : activeBids.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="text-6xl mb-6 text-muted-foreground">▬▬▬</div>
                  <div className="text-xl font-medium mb-2">NO AVAILABLE ORDERS</div>
                  <p className="text-muted-foreground">
                    Check back later for new opportunities
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {activeBids.map((bid: CrossChainBid) => {
                    const token = getTokenByAddress(selectedChain, bid.tokenInfo.l2_TokenCorrespondingL1Address);
                    const amountRequested = token
                      ? formatUnits(bid?.amountRemaining, token.decimals)
                      : "0";

                    return (
                      <Card
                        key={bid?.l1_BidId?.toString()}
                        className="p-6 hover-elevate"
                        data-testid={`card-order-${bid.l1_BidId}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="font-mono text-lg font-bold">#{bid?.l1_BidId?.toString()}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatChainId(Number(bid?.l2_ChainId))} → {formatChainId(selectedChain)}
                            </div>
                          </div>
                          {
                            bid.bidInfo.isPercentageGainToBidder ? (
                              <Badge className="bg-rose-500/20 text-rose border-rose-500/30 border text-lg px-3 py-1">
                            {Number(bid?.bidInfo.percentage) / 100}%
                          </Badge>
                            ) : (<Badge className="bg-primary/20 text-primary border-primary/30 border text-lg px-3 py-1">
                            {Number(bid?.bidInfo.percentage) / 100}%
                          </Badge>)
                          }
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">AVAILABLE TO FILL</span>
                            <span className="font-mono">
                              {formatUnits(bid?.amountRemaining, token?.decimals || 18)} {token?.symbol || "TOKEN"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">MIN FILL</span>
                            <span className="font-mono">
                              {bid?.tokenInfo.l2_TokenMinAmount ? formatUnits(bid?.tokenInfo.l2_TokenMinAmount, token?.decimals! || 18) : "0"}{" "}
                              {token?.symbol || "TOKEN"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">POTENTIAL PROFIT</span>
                            <span className="font-mono text-primary">
                              {
                                bid.bidInfo.isPercentageGainToBidder ?
                                <> - {Number(bid?.bidInfo.percentage) /100} </> :
                                <> + {Number(bid?.bidInfo.percentage) / 100} </>
                              }
                              {"%"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">SLIPPAGE</span>
                            <span className="font-mono">{Number(bid?.bidInfo.percentage) / 100}%</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">EXPIRES</span>
                            <span className="font-mono">
                              {new Date(Number(bid?.expiresAt) * 1000).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full"
                              onClick={() => setSelectedBid(bid)}
                              data-testid={`button-fill-${bid.l1_BidId}`}
                            >
                              FILL ORDER {bid.l1_BidId.toString()}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>FILL ORDER #{bid?.l1_BidId?.toString()}</DialogTitle>
                              <DialogDescription>
                                Provide liquidity and earn {Number(bid?.bidInfo.percentage) / 100}% premium
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="fillAmount">
                                  FILL AMOUNT ({token?.symbol || "TOKEN"})
                                </Label>
                                <Input
                                  id="fillAmount"
                                  type="text"
                                  placeholder="0.0"
                                  value={fillAmount}
                                  onChange={(e) => setFillAmount(e.target.value)}
                                  className="font-mono"
                                  data-testid="input-fill-amount"
                                  min={formatUnits(bid?.tokenInfo?.l2_TokenMinAmount, token?.decimals ||  18)}
                                />
                                <div className="text-xs text-muted-foreground">
                                  {/* {bid?.tokenInfo?.l2_TokenMinAmount.toLocaleString()} */}
                                  MIN: {formatUnits(bid?.tokenInfo?.l2_TokenMinAmount, token?.decimals ||  18)}{" "}
                                  | MAX: {formatUnits(bid?.amountRemaining, token?.decimals ||  18)}{" "}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="fillRemaining"
                                  checked={fillRemaining}
                                  onChange={(e) => setFillRemaining(e.target.checked)}
                                  className="rounded"
                                />
                                <Label htmlFor="fillRemaining" className="text-sm cursor-pointer">
                                  Fill all remaining amount
                                </Label>
                              </div>

                              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">YOUR PROFIT</span>
                                  <span className="font-mono text-primary">
                                    {calculateProfit(Number(bid?.bidInfo.percentage), fillAmount)}{" "}
                                    {token?.symbol}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">PROTOCOL FEE (0.2%)</span>
                                  <span className="font-mono">
                                    {fillAmount
                                      ? ((parseFloat(fillAmount) * 20) / 10000).toFixed(4)
                                      : "0.00"}{" "}
                                    {token?.symbol}
                                  </span>
                                </div>
                              </div>

                              <Button
                                className="w-full"
                                onClick={handleFillOrder}
                                disabled={!fillAmount || isFilling}
                                data-testid="button-confirm-fill"
                              >
                                {isFilling ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    FILLING...
                                  </>
                                ) : (
                                  "CONFIRM FILL"
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active">
              <div className="flex flex-col items-center justify-center py-24">
                <div className="text-6xl mb-6 text-muted-foreground">▬▬▬</div>
                <div className="text-xl font-medium mb-2">NO ACTIVE FILLS</div>
                <p className="text-muted-foreground">Your filled orders will appear here</p>
                {userFillIds && userFillIds.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Found {userFillIds.length} fill(s). Implement full details display using useGetBid.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
