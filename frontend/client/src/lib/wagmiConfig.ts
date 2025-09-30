import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
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

const projectId = "b36df91dc51c4a6c1b01ef9b4e217a55";

export const config = createConfig({
  chains: [sonicTestnet, baseSepolia],
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
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
