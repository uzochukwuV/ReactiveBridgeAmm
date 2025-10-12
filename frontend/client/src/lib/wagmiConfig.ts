import { http, createConfig } from "wagmi";
import { baseSepolia, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const sonicTestnet = {
  id: 64165,
  name: "Sonic Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Sonic",
    symbol: "S",
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.soniclabs.com"] },
    public: { http: ["https://rpc.testnet.soniclabs.com"] },
  },
  blockExplorers: {
    default: { name: "SonicScan", url: "https://testnet.sonicscan.org" },
  },
  testnet: true,
} as const;

const projectId = "001f5fa4dd2f2b16662704bcaa5d21d5";

export const config = createConfig({
  chains: [sonicTestnet, baseSepolia, sepolia],
  connectors: [
    injected({ target: "metaMask" }),
    walletConnect({
      projectId,
      showQrModal: true,
    }),
  ],
  transports: {
    [sonicTestnet.id]: http(),
    [baseSepolia.id]: http(),
    [sepolia.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
