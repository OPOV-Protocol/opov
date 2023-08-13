'use client';

import * as React from 'react';
import {
  RainbowKitProvider,
  getDefaultWallets,
  connectorsForWallets,
  lightTheme
} from '@rainbow-me/rainbowkit';
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  optimismGoerli,
  baseGoerli
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    optimismGoerli,
    baseGoerli,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [baseGoerli] : []),
  ],
  [publicProvider()]
);

const projectId = "5dfbd43856c7249059f54d1a60b2614a";

const { wallets } = getDefaultWallets({
  appName: 'OPOV',
  projectId,
  chains,
});

const appInfo = {
  appName: 'OPOV',
};

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Other',
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        appInfo={appInfo}
        theme={lightTheme({
          accentColor: '#55c076',
          borderRadius: 'large',
          overlayBlur: 'small',
        })}
      >
        {mounted && children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
}