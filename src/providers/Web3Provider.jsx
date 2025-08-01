import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { createConfig, WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const seiEvm = {
  id: 1329,
  name: "Sei EVM",
  network: "sei",
  nativeCurrency: {
    name: "SEI",
    symbol: "SEI",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://evm-rpc.sei-apis.com"] },
    public: { http: ["https://evm-rpc.sei-apis.com"] },
  },
  blockExplorers: {
    default: { name: "Sei Explorer", url: "https://www.seiscan.app" },
  },
  testnet: false,
};

const chains = [seiEvm];

const { connectors } = getDefaultWallets({
  appName: "Just MEME IT",
  projectId: "e85c7cbd05de2a1b35681d9efe4e643b",
  chains,
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient: http(),
  chains,
});

const queryClient = new QueryClient();

export function Web3Provider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          chains={chains}
          theme={lightTheme({
            accentColor: "#ffffff",
            accentColorForeground: "#000000ff",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
