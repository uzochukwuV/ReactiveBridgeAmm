import CrossChainTimeline from "../CrossChainTimeline";
import { CrossChainEvent } from "@shared/bridgeSchema";

export default function CrossChainTimelineExample() {
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
      txHash: "0x90abcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
      timestamp: Math.floor(Date.now() / 1000) - 300,
      status: "pending",
    },
  ];

  return (
    <div className="p-4 bg-background">
      <CrossChainTimeline events={mockEvents} />
    </div>
  );
}
