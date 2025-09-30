import OrderCard from "../OrderCard";
import { Order } from "@shared/bridgeSchema";

export default function OrderCardExample() {
  const mockOrder: Order = {
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
  };

  return (
    <div className="p-4 bg-background">
      <OrderCard order={mockOrder} onCancel={(id) => console.log("Cancel order:", id)} />
    </div>
  );
}
