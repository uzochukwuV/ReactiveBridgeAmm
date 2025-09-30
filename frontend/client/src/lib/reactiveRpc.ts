const REACTIVE_RPC_URL = "https://lasna-rpc.rnk.dev/";

export interface ReactiveTransaction {
  hash: string;
  number: string;
  time: number;
  root: string;
  limit: number;
  used: number;
  type: number;
  status: number;
  from: string;
  to: string;
  createContract: boolean;
  sessionId: string;
  refChainId: number;
  refTx: string;
  refEventIndex: number;
  data: string;
  rData: string;
}

export interface ReactiveLog {
  txHash: string;
  address: string;
  topics: string[];
  data: string;
}

async function rpcCall<T>(method: string, params: any[]): Promise<T> {
  const response = await fetch(REACTIVE_RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id: 1,
    }),
  });

  const json = await response.json();
  
  if (json.error) {
    throw new Error(json.error.message || "RPC call failed");
  }

  return json.result;
}

export async function getTransactionByHash(
  rvmId: string,
  txHash: string
): Promise<ReactiveTransaction> {
  return rpcCall<ReactiveTransaction>("rnk_getTransactionByHash", [
    rvmId,
    txHash,
  ]);
}

export async function getTransactionByNumber(
  rvmId: string,
  txNumber: string
): Promise<ReactiveTransaction> {
  return rpcCall<ReactiveTransaction>("rnk_getTransactionByNumber", [
    rvmId,
    txNumber,
  ]);
}

export async function getTransactionLogs(
  rvmId: string,
  txNumber: string
): Promise<ReactiveLog[]> {
  return rpcCall<ReactiveLog[]>("rnk_getTransactionLogs", [rvmId, txNumber]);
}

export async function getHeadNumber(rvmId: string): Promise<string> {
  return rpcCall<string>("rnk_getHeadNumber", [rvmId]);
}

export async function getTransactions(
  rvmId: string,
  from: string,
  limit: string
): Promise<ReactiveTransaction[]> {
  return rpcCall<ReactiveTransaction[]>("rnk_getTransactions", [
    rvmId,
    from,
    limit,
  ]);
}

export async function getRnkAddressMapping(
  reactNetworkContrAddr: string
): Promise<string> {
  return rpcCall<string>("rnk_getRnkAddressMapping", [reactNetworkContrAddr]);
}
