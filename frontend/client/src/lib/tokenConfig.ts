export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo: string;
  chainId: number;
}

export const TOKENS: Record<number, Token[]> = {
   11155111: [
    {
      address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      symbol: "Link",
      name: "Link",
      decimals: 18,
      logo: "◆",
      chainId: 11155111,
    },
    {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logo: "$",
      chainId: 11155111,
    },
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      name: "Etherum",
      decimals: 18,
      logo: "Ξ",
      chainId: 11155111,
    },
  ],
  64165: [
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "S",
      name: "Sonic",
      decimals: 18,
      logo: "◆",
      chainId: 64165,
    },
    {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logo: "$",
      chainId: 64165,
    },
    {
      address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logo: "Ξ",
      chainId: 64165,
    },
  ],
  84532: [
    {
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      name: "Ethereum",
      decimals: 18,
      logo: "●",
      chainId: 84532,
    },
    {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logo: "$",
      chainId: 84532,
    },
    {
      address: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      symbol: "LINK",
      name: "Chainlink",
      decimals: 18,
      logo: "⬡",
      chainId: 84532,
    },
  ],
};

export const CANONICAL_TOKEN_MAPPING: Record<string, string> = {
  "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  "0x779877A7B0D9E8603169DdbD7836e478b4624789": "0x779877A7B0D9E8603169DdbD7836e478b4624789",
};

export function getTokensByChainId(chainId: number): Token[] {
  return TOKENS[chainId] || [];
}

export function getTokenByAddress(chainId: number, address: string): Token | undefined {
  const tokens = getTokensByChainId(chainId);
  return tokens.find(
    (t) => t.address.toLowerCase() === address?.toLowerCase()
  );
}

export function formatTokenAmount(amount: string | number, decimals: number): string {
  try {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    const divisor = Math.pow(10, decimals);
    return (num / divisor).toFixed(decimals === 6 ? 2 : 4);
  } catch {
    return "0.00";
  }
}

export function parseTokenAmount(amount: string, decimals: number): string {
  try {
    const num = parseFloat(amount);
    const multiplier = Math.pow(10, decimals);
    return Math.floor(num * multiplier).toString();
  } catch {
    return "0";
  }
}

export function getCanonicalAddress(originChain: number, tokenAddress: string): string {
  return CANONICAL_TOKEN_MAPPING[tokenAddress] || tokenAddress;
}
