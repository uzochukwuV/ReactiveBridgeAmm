export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  bridgeContract: string;
  icon: string;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  64165: {
    id: 64165,
    name: "Sonic Testnet",
    rpcUrl: "https://rpc.testnet.soniclabs.com",
    explorer: "https://testnet.sonicscan.org",
    nativeCurrency: {
      name: "Sonic",
      symbol: "S",
      decimals: 18,
    },
    bridgeContract: "0x0000000000000000000000000000000000000000",
    icon: "◆",
  },
  84532: {
    id: 84532,
    name: "Base Sepolia",
    rpcUrl: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
    bridgeContract: "0x0000000000000000000000000000000000000000",
    icon: "●",
  },
};

export const REACTIVE_NETWORK = {
  name: "Reactive Network",
  rpcUrl: "https://lasna-rpc.rnk.dev/",
  explorer: "https://reactive.network",
  icon: "▲",
};

export function getChainById(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS[chainId];
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatChainId(chainId: number): string {
  const chain = getChainById(chainId);
  return chain ? chain.name : `Chain ${chainId}`;
}
