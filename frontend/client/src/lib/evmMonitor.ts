import { getChainById } from "./chainConfig";

export interface EVMTransaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string;
  value: string;
  status: "success" | "failed" | "pending";
  timestamp: number;
}

export interface EVMLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

export async function getTransaction(
  chainId: number,
  txHash: string
): Promise<EVMTransaction | null> {
  const chain = getChainById(chainId);
  if (!chain) return null;

  try {
    const response = await fetch(chain.rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionByHash",
        params: [txHash],
        id: 1,
      }),
    });

    const json = await response.json();
    
    if (!json.result) return null;

    return {
      hash: json.result.hash,
      blockNumber: parseInt(json.result.blockNumber, 16),
      from: json.result.from,
      to: json.result.to,
      value: json.result.value,
      status: "pending",
      timestamp: Date.now() / 1000,
    };
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    return null;
  }
}

export async function getTransactionReceipt(
  chainId: number,
  txHash: string
): Promise<{ status: "success" | "failed"; logs: EVMLog[] } | null> {
  const chain = getChainById(chainId);
  if (!chain) return null;

  try {
    const response = await fetch(chain.rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txHash],
        id: 1,
      }),
    });

    const json = await response.json();
    
    if (!json.result) return null;

    return {
      status: json.result.status === "0x1" ? "success" : "failed",
      logs: json.result.logs.map((log: any) => ({
        address: log.address,
        topics: log.topics,
        data: log.data,
        blockNumber: parseInt(log.blockNumber, 16),
        transactionHash: log.transactionHash,
        logIndex: parseInt(log.logIndex, 16),
      })),
    };
  } catch (error) {
    console.error("Failed to fetch transaction receipt:", error);
    return null;
  }
}

export async function waitForTransaction(
  chainId: number,
  txHash: string,
  confirmations: number = 1
): Promise<boolean> {
  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    const receipt = await getTransactionReceipt(chainId, txHash);
    
    if (receipt) {
      return receipt.status === "success";
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    attempts++;
  }

  return false;
}
