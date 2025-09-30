import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ChainSwitcher from "@/components/ChainSwitcher";
import TokenSelector from "@/components/TokenSelector";
import { Token, getTokensByChainId } from "@/lib/tokenConfig";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAccount } from "wagmi";

export default function Bridge() {
  const { isConnected } = useAccount();
  const [fromChain, setFromChain] = useState(64165);
  const [toChain, setToChain] = useState(84532);
  const [depositToken, setDepositToken] = useState<Token | undefined>(getTokensByChainId(64165)[0]);
  const [requestToken, setRequestToken] = useState<Token | undefined>(getTokensByChainId(84532)[1]);
  const [depositAmount, setDepositAmount] = useState("");
  const [requestAmount, setRequestAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [premium, setPremium] = useState("2.0");
  const [duration, setDuration] = useState("3600");
  const [usePriceFeed, setUsePriceFeed] = useState(true);

  const handleSwitchChains = () => {
    console.log("Switch chains");
    const tempChain = fromChain;
    const tempToken = depositToken;
    setFromChain(toChain);
    setToChain(tempChain);
    setDepositToken(requestToken);
    setRequestToken(tempToken);
  };

  const handlePlaceOrder = () => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }

    console.log("Place order:", {
      fromChain,
      toChain,
      depositToken,
      requestToken,
      depositAmount,
      requestAmount,
      slippage,
      premium,
      duration,
      usePriceFeed,
    });
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
            Place cross-chain orders between Sonic and Base testnets
          </p>
        </div>

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
                      <TokenSelector
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
                      BALANCE: {isConnected ? "1.5" : "0.0"} {depositToken?.symbol || "TOKEN"}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requestToken" className="text-xs uppercase tracking-wider">
                      REQUEST TOKEN
                    </Label>
                    <div className="mt-2">
                      <TokenSelector
                        chainId={toChain}
                        selectedToken={requestToken}
                        onSelect={(token) => {
                          setRequestToken(token);
                          console.log("Request token selected:", token);
                        }}
                        label=""
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="requestAmount" className="text-xs uppercase tracking-wider">
                      REQUEST AMOUNT
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
                  disabled={!isConnected || !depositAmount || !requestAmount || !depositToken || !requestToken}
                  data-testid="button-place-order"
                >
                  {isConnected ? "PLACE ORDER" : "CONNECT WALLET TO CONTINUE"}
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

                <div className="border-t pt-4"></div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">EXPECTED OUTPUT</span>
                  <span className="font-mono font-medium">
                    {calculateOutput()} {requestToken?.symbol || "TOKEN"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">MARKET MAKER PREMIUM</span>
                  <span className="font-mono text-primary">
                    {requestAmount ? ((parseFloat(requestAmount) * parseFloat(premium)) / 100).toFixed(2) : "0.00"} {requestToken?.symbol || "TOKEN"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">PROTOCOL FEE</span>
                  <span className="font-mono">
                    {requestAmount ? ((parseFloat(requestAmount) * 0.3) / 100).toFixed(2) : "0.00"} {requestToken?.symbol || "TOKEN"}
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
                      <div className="text-2xl mb-1">◆</div>
                      <div className="text-xs">SONIC</div>
                    </div>
                    <div className="flex-1 flex items-center gap-1">
                      <div className="h-px flex-1 bg-primary"></div>
                      <div className="text-primary text-xs">▲</div>
                      <div className="h-px flex-1 bg-primary"></div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">●</div>
                      <div className="text-xs">BASE</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
