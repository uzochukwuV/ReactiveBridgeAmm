import { z } from "zod";

export const orderStatusEnum = z.enum([
  "active",
  "filled",
  "cancelled",
  "pending",
]);

export type OrderStatus = z.infer<typeof orderStatusEnum>;

export interface Order {
  orderId: string;
  originChain: number;
  destinationChain: number;
  orderer: string;
  tokenDeposited: string;
  tokenRequested: string;
  amountDeposited: string;
  amountRequested: string;
  amountDepositedRemaining: string;
  amountRequestedRemaining: string;
  minFillAmount: string;
  duration: number;
  slippage: number;
  usePriceFeed: boolean;
  premiumBps: number;
  protocolFeeBps: number;
  timestamp: number;
  status: OrderStatus;
  txHash: string;
}

export interface FillOrder {
  fillId: string;
  orderId: string;
  originChain: number;
  destinationChain: number;
  filler: string;
  amountFilled: string;
  timestamp: number;
  finalized: boolean;
  txHash: string;
}

export interface CrossChainEvent {
  step: number;
  name: string;
  chain: number | string;
  txHash: string;
  timestamp: number;
  status: "completed" | "pending" | "failed";
  gasUsed?: number;
}

export const placeOrderSchema = z.object({
  destinationChain: z.number(),
  tokenDeposited: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tokenRequested: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amountDeposited: z.string(),
  amountRequested: z.string(),
  minFillAmount: z.string(),
  duration: z.number().min(60).max(86400),
  slippage: z.number().min(0).max(10000),
  usePriceFeed: z.boolean(),
  premiumBps: z.number().min(0).max(1000),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const fillOrderSchema = z.object({
  orderId: z.string(),
  originChain: z.number(),
  amountToFill: z.string(),
});

export type FillOrderInput = z.infer<typeof fillOrderSchema>;
