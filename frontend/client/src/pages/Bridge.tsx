import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ChainSwitcher from "@/components/ChainSwitcher";
import NetworkAwareTokenSelector from "@/components/NetworkAwareTokenSelector";
import ChainSelector from "@/components/ChainSelector";
import { Token, getTokensByChainId } from "@/lib/tokenConfig";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAccount, useBalance } from "wagmi";
import { useApproveToken, useCreateCrossChainBid, useGetAmountOut } from "@/hooks/useL1Contract";
import { useToast } from "@/hooks/use-toast";
import { formatUnits, parseEther } from "viem";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useBridgeState, useNetworkState, useTokenState } from "@/hooks/useAppState";
import { TokenConfig } from "@/lib/networkConfig";

export default function Bridge() {
  const { isConnected, address } = useAccount();
  const { toast } = useToast();
  
  // Use new app state hooks
  const { fromChain, toChain, setFromChain, setToChain, switchChains, fromChainConfig, toChainConfig } = useBridgeState();
  const { networkType, setNetworkType, availableChains } = useNetworkState();
  const { getChainTokens, getTokenBySymbol } = useTokenState();
  
  // Check if contracts are deployed for current chain
  const fromChainContracts = fromChainConfig?.contracts;
  const isContractDeployed = fromChainContracts?.l1Contract && fromChainContracts.l1Contract !== "0x0000000000000000000000000000000000000000";
  
  const [depositToken, setDepositToken] = useState<TokenConfig | undefined>();
  const [requestToken, setRequestToken] = useState<TokenConfig | undefined>();
  const [correspondingL1Token, setCorrespondingL1Token] = useState<TokenConfig | undefined>();
  const [depositAmount, setDepositAmount] = useState("");

  const [requestAmount, setRequestAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [premium, setPremium] = useState("2.0");
  const [duration, setDuration] = useState("360000");
  const [usePriceFeed, setUsePriceFeed] = useState(true);

   // Get balance for deposit token
  const { data: balance } = useBalance({
    address,
    token: depositToken?.address === '0x0000000000000000000000000000000000000000' ? undefined : depositToken?.address as `0x${string}`,
    chainId: fromChain,
    query: { enabled: !!address && !!depositToken }
  });



  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minFillAmount, setMinFillAmount] = useState("");

  // Get contract hook
  const { createBid, isPending, isSuccess } = useCreateCrossChainBid(fromChain);


  // get amount out
  const {  isLoading: isLoadingAmountOut, data: amountOut} = useGetAmountOut(
    fromChain,
    depositToken?.address,
    requestToken?.address,
    depositToken ? BigInt(Number(depositAmount || 0) * 10 ** depositToken.decimals) : BigInt(0)
  );

  const {approve, } = useApproveToken(fromChain)

  useEffect(()=>{
    console.log(depositAmount, isLoadingAmountOut, amountOut)
  },[isLoadingAmountOut, depositAmount])

  // Reset tokens when network type changes
  useEffect(() => {
    setDepositToken(undefined);
    setRequestToken(undefined);
    setCorrespondingL1Token(undefined);
  }, [networkType]);

  // Initialize tokens when chains change
  useEffect(() => {
    const fromTokens = getChainTokens(fromChain);
    const toTokens = getChainTokens(toChain);
    
    if (!depositToken && Object.keys(fromTokens).length > 0) {
      setDepositToken(Object.values(fromTokens)[0]);
    }
    if (!requestToken && Object.keys(toTokens).length > 0) {
      setRequestToken(Object.values(toTokens)[0]);
    }
  }, [fromChain, toChain]); // Remove function dependencies to prevent loops

  // Find corresponding L1 token when L2 token is selected
  useEffect(() => {
    if (requestToken) {
      // For now, assume same symbol tokens correspond to each other
      // TODO: Replace with actual contract call to l1TokenToL2Token mapping
      const l1Token = getTokenBySymbol(fromChain, requestToken.symbol);
      setCorrespondingL1Token(l1Token);
    }
  }, [requestToken, fromChain, getTokenBySymbol]);

  const handleSwitchChains = () => {
    switchChains();
    const tempToken = depositToken;
    setDepositToken(requestToken);
    setRequestToken(tempToken);
  };

  const handlePlaceOrder = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!depositToken || !requestToken || !depositAmount || !correspondingL1Token) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and ensure L1-L2 token mapping exists",
        variant: "destructive",
      });
      return;
    }

    console.log(depositAmount)
   
    let amount = Number(depositAmount) * 10 ** depositToken.decimals
    let minFill = Number(minFillAmount) * 10 ** requestToken.decimals

    if (amount > Number(balance?.value)) {
      toast({
        title: "Insufficient balance",
        description: "Please check your balance",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare TokenInfo struct
      const tokenInfo = {
        l1_TokenAddress: depositToken.address,
        l1_TokenAmount: BigInt(amount),
        l1_TokenCorrespondingL2Address: correspondingL1Token.address,
        l2_TokenAddress: requestToken.address,
        l2_TokenMinAmount: BigInt(minFill || amount),
      };

      // Prepare BidInfo struct  
      const bidInfo = {
        l1_BidOwnerAddressOnL2: address,
        percentage: Math.floor(parseFloat(premium) * 100), // Convert to basis points
        isPercentageGainToBidder: true,
      };

      console.log("TokenInfo:", tokenInfo);
      console.log("BidInfo:", bidInfo);

      const tx = await approve(
        depositToken.address,
        BigInt(amount),
      )

      const txHash = await createBid({
        receiver: address,
        destinationChain: toChain,
        tokenInfo,
        bidInfo,
        duration: parseInt(duration),
      });

      toast({
        title: "Order placed successfully!",
        description: `Transaction: ${txHash}`,
      });

      // Reset form
      setDepositAmount("");
      setRequestAmount("");
    } catch (error: any) {
      toast({
        title: "Transaction failed",
        description: error?.message || "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateOutput = () => {
    if (!requestAmount) return "0.00";
    const premiumAmount = (parseFloat(requestAmount) * parseFloat(premium)) / 100;
    const protocolFee = (parseFloat(requestAmount) * 0.3) / 100;
    return (parseFloat(requestAmount) - premiumAmount - protocolFee).toFixed(2);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            BRIDGE INTERFACE
          </h1>
          <p className="text-muted-foreground">
            Provide liquidity or bridge tokens between chains
          </p>
        </div>

        <Tabs defaultValue="bridge" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bridge">BRIDGE TOKENS</TabsTrigger>
            <TabsTrigger value="provide">PROVIDE LIQUIDITY</TabsTrigger>
          </TabsList>

          <TabsContent value="bridge" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <Card className="p-6">
              <div className="space-y-6">
                <ChainSwitcher
                  fromChain={fromChain}
                  toChain={toChain}
                  onSwitch={handleSwitchChains}
                />

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="depositToken" className="text-xs uppercase tracking-wider">
                      DEPOSIT TOKEN
                    </Label>
                    <div className="mt-2">
                      <NetworkAwareTokenSelector
                        chainId={fromChain}
                        selectedToken={depositToken}
                        onSelect={(token) => {
                          setDepositToken(token);
                          console.log("Deposit token selected:", token);
                        }}
                        label=""
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="depositAmount" className="text-xs uppercase tracking-wider">
                      DEPOSIT AMOUNT
                    </Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                        id="depositAmount"
                        type="text"
                        placeholder="0.0"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="flex-1 font-mono"
                        data-testid="input-deposit-amount"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setDepositAmount("1.0")}
                        data-testid="button-max-deposit"
                      >
                        MAX
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      BALANCE: {balance ? formatUnits(balance.value, balance.decimals) : "0.0"} {depositToken?.symbol || "TOKEN"}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requestToken" className="text-xs uppercase tracking-wider">
                      REQUEST TOKEN
                    </Label>
                    <div className="mt-2">
                      <NetworkAwareTokenSelector
                        chainId={toChain}
                        selectedToken={requestToken}
                        onSelect={(token) => {
                          setRequestToken(token);
                          console.log("Request token selected:", token);
                        }}
                        label=""
                      />
                      {correspondingL1Token && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Corresponding L1 token: {correspondingL1Token.symbol}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requestAmount" className="text-xs uppercase tracking-wider">
                      MIN FILL AMOUNT
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="requestAmount"
                        type="text"
                        placeholder="0.0"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(e.target.value)}
                        className="font-mono"
                        data-testid="input-request-amount"
                      />
                    </div>
                  </div>
                </div>

                <Accordion type="single" collapsible className="border-t pt-4">
                  <AccordionItem value="advanced" className="border-none">
                    <AccordionTrigger className="text-sm uppercase tracking-wider">
                      ADVANCED SETTINGS
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div>
                        <Label htmlFor="slippage" className="text-xs uppercase tracking-wider">
                          SLIPPAGE TOLERANCE (%)
                        </Label>
                        <Input
                          id="slippage"
                          type="text"
                          value={slippage}
                          onChange={(e) => setSlippage(e.target.value)}
                          className="mt-2 font-mono"
                          data-testid="input-slippage"
                        />
                      </div>

                      <div>
                        <Label htmlFor="premium" className="text-xs uppercase tracking-wider">
                          MARKET MAKER PREMIUM (%)
                        </Label>
                        <Input
                          id="premium"
                          type="text"
                          value={premium}
                          onChange={(e) => setPremium(e.target.value)}
                          className="mt-2 font-mono"
                          data-testid="input-premium"
                        />
                      </div>

                      <div>
                        <Label htmlFor="duration" className="text-xs uppercase tracking-wider">
                          ORDER DURATION (SECONDS)
                        </Label>
                        <Input
                          id="duration"
                          type="text"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="mt-2 font-mono"
                          data-testid="input-duration"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label htmlFor="priceFeed" className="text-xs uppercase tracking-wider">
                          USE PRICE FEED
                        </Label>
                        <Switch
                          id="priceFeed"
                          checked={usePriceFeed}
                          onCheckedChange={setUsePriceFeed}
                          data-testid="switch-price-feed"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={!isConnected || !depositAmount || !requestAmount || !depositToken || !requestToken || !isContractDeployed}
                  data-testid="button-place-order"
                >
                  {!isContractDeployed ? "CONTRACTS NOT DEPLOYED" : isConnected ? "BRIDGE TOKENS" : "CONNECT WALLET TO CONTINUE"}
                </Button>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-6 uppercase tracking-wide">
                ORDER PREVIEW
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">FROM</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">
                      {depositAmount || "0.00"} {depositToken?.symbol || "TOKEN"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">TO</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">
                      {requestAmount || "0.00"} {requestToken?.symbol || "TOKEN"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ORACLE RATE</span>
                  <span className="font-mono">
                    {isLoadingAmountOut && "--"}
                    {amountOut && requestToken ? formatUnits(amountOut as bigint, requestToken.decimals) : "--"} {requestToken?.symbol || "TOKEN"}
                  </span>
                </div>

                <div className="border-t pt-4"></div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">EXPECTED OUTPUT</span>
                  <span className="font-mono font-medium">
                    {amountOut && formatUnits(amountOut as bigint, requestToken?.decimals as number)} {requestToken?.symbol || "TOKEN"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">MARKET MAKER PREMIUM</span>
                  <span className="font-mono text-primary">
                    { amountOut && ((Number(formatUnits(amountOut as bigint, requestToken?.decimals as number)) * parseFloat(premium)) / 100).toFixed(2) || "0.00"} {requestToken?.symbol || "TOKEN"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">PROTOCOL FEE</span>
                  <span className="font-mono">
                    {requestAmount ? ((Number(formatUnits(amountOut as bigint, requestToken?.decimals as number)) * 0.2) / 100).toFixed(3) : "0.00"} {requestToken?.symbol || "TOKEN"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ESTIMATED TIME</span>
                  <span className="font-mono">~30s</span>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="text-xs text-muted-foreground uppercase mb-3">
                    ROUTE VISUALIZATION
                  </div>
                  <div className="flex items-center justify-between gap-2 p-4 rounded-lg bg-muted/50">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{fromChainConfig?.icon}</div>
                      <div className="text-xs">{fromChainConfig?.name}</div>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-px flex-1 bg-primary"></div>
                      <div className="text-primary text-xs">▲</div>
                      <div className="h-px flex-1 bg-primary"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">{toChainConfig?.icon}</div>
                      <div className="text-xs">{toChainConfig?.name}</div>
                    </div>
                  </div>
                </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="provide" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="liquidityToken" className="text-xs uppercase tracking-wider">
                        LIQUIDITY TOKEN
                      </Label>
                      <div className="mt-2">
                        <NetworkAwareTokenSelector
                          chainId={fromChain}
                          selectedToken={depositToken}
                          onSelect={setDepositToken}
                          label=""
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="liquidityAmount" className="text-xs uppercase tracking-wider">
                        LIQUIDITY AMOUNT
                      </Label>
                      <div className="mt-2 flex gap-2">
                        <Input
                          id="liquidityAmount"
                          type="text"
                          placeholder="0.0"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="flex-1 font-mono"
                        />
                        <Button
                          variant="outline"
                          onClick={() => balance && setDepositAmount(formatUnits(balance.value, balance.decimals))}
                        >
                          MAX
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        BALANCE: {balance ? formatUnits(balance.value, balance.decimals) : "0.0"} {depositToken?.symbol || "TOKEN"}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="destinationChain" className="text-xs uppercase tracking-wider">
                        DESTINATION CHAIN
                      </Label>
                      <div className="mt-2">
                        <ChainSelector
                          selectedChainId={toChain}
                          onSelect={setToChain}
                          label=""
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="destinationToken" className="text-xs uppercase tracking-wider">
                        DESTINATION TOKEN
                      </Label>
                      <div className="mt-2">
                        <NetworkAwareTokenSelector
                          chainId={toChain}
                          selectedToken={requestToken}
                          onSelect={setRequestToken}
                          label=""
                        />
                        {correspondingL1Token && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Corresponding L1 token: {correspondingL1Token.symbol}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="border-t pt-4">
                    <AccordionItem value="advanced" className="border-none">
                      <AccordionTrigger className="text-sm uppercase tracking-wider">
                        LIQUIDITY SETTINGS
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        <div>
                          <Label htmlFor="premiumRate" className="text-xs uppercase tracking-wider">
                            PREMIUM RATE (%)
                          </Label>
                          <Input
                            id="premiumRate"
                            type="text"
                            value={premium}
                            onChange={(e) => setPremium(e.target.value)}
                            className="mt-2 font-mono"
                          />
                        </div>

                        <div>
                          <Label htmlFor="minFill" className="text-xs uppercase tracking-wider">
                            MINIMUM FILL AMOUNT
                          </Label>
                          <Input
                            id="minFill"
                            type="text"
                            value={minFillAmount}
                            onChange={(e) => setMinFillAmount(e.target.value)}
                            placeholder={depositAmount || "0.0"}
                            className="mt-2 font-mono"
                          />
                        </div>

                        <div>
                          <Label htmlFor="bidDuration" className="text-xs uppercase tracking-wider">
                            BID DURATION (SECONDS)
                          </Label>
                          <Input
                            id="bidDuration"
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="mt-2 font-mono"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={!isConnected || !depositAmount || !depositToken || !requestToken || isPending || isSubmitting || !isContractDeployed}
                  >
                    {!isContractDeployed ? "CONTRACTS NOT DEPLOYED" : isPending || isSubmitting ? "CREATING BID..." : isConnected ? "CREATE LIQUIDITY BID" : "CONNECT WALLET TO CONTINUE"}
                  </Button>
                </div>
              </Card>
            </div>
            
            <div className="lg:col-span-5">
              <Card className="p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-6 uppercase tracking-wide">
                  BID PREVIEW
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">LIQUIDITY PROVIDED</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        {depositAmount || "0.00"} {depositToken?.symbol || "TOKEN"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">DESTINATION TOKEN</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">
                        {requestToken?.symbol || "TOKEN"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4"></div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">PREMIUM RATE</span>
                    <span className="font-mono text-primary">
                      {premium}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">MIN FILL AMOUNT</span>
                    <span className="font-mono">
                      {minFillAmount || depositAmount || "0.00"} {depositToken?.symbol || "TOKEN"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">BID DURATION</span>
                    <span className="font-mono">
                      {Math.floor(parseInt(duration || "0") / 3600)}h
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">POTENTIAL EARNINGS</span>
                    <span className="font-mono text-primary">
                      {depositAmount ? ((parseFloat(depositAmount) * parseFloat(premium)) / 100).toFixed(4) : "0.00"} {depositToken?.symbol || "TOKEN"}
                    </span>
                  </div>

                  {(isPending || isSubmitting) && (
                    <div className="border-t pt-4 mt-4">
                      <div className="text-xs text-muted-foreground uppercase mb-3">
                        TRANSACTION STATUS
                      </div>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                        <span className="text-sm">
                          {isPending ? "Confirming transaction..." : "Approving tokens..."}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
