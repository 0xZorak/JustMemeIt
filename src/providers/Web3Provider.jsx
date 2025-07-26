import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { createConfig, WagmiProvider, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const chains = [mainnet, sepolia];

const { connectors } = getDefaultWallets({
  appName: 'Just MEME IT',
  projectId: 'e85c7cbd05de2a1b35681d9efe4e643b', // your WalletConnect project ID
  chains,
});

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient: http(),
  chains,
});

// Create a QueryClient instance
const queryClient = new QueryClient();

export function Web3Provider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}