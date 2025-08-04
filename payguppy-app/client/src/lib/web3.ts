import { createConfig, http } from 'wagmi';
import { mainnet, polygon, bsc, arbitrum, liskSepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

const LiskSepoliaNetwork = {
  chainId: 4202, // A unique Chain ID for your network
  name: 'Lisk Sepolia', // The name of your network
  currency: 'ETH', // The currency symbol
  explorerUrl: 'https://sepolia-blockscout.lisk.com ', // Link to the block explorer
  rpcUrl: 'https://rpc.sepolia-api.lisk.com' // ** YOUR CUSTOM RPC URL **
};


// 1. Get a project ID at https://cloud.reown.com
const chains = [mainnet, polygon, bsc, arbitrum] as const;

// 2. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  projectId,
  ssr: false
});

// 3. Configure the metadata
const metadata = {
  name: 'PayGuppy',
  description: 'PayGuppy - Your NextGen Payment App',
  url: 'https://payguppy.xyz', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// 4. Create AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [liskSepolia],
  metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
    email: false, // default to true
    socials: false, // default to true
    emailShowWallets: true // default to true
  }
});

export const config = wagmiAdapter.wagmiConfig;

export const blockchains = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    chain: mainnet,
    color: 'bg-gray-800',
    tokens: [
      { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    ]
  },
  {
    id: 'polygon',
    name: 'Polygon',
    chain: polygon,
    color: 'bg-purple-600',
    tokens: [
      { symbol: 'MATIC', name: 'Polygon', decimals: 18 },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    ]
  },
  {
    id: 'bsc',
    name: 'BSC',
    chain: bsc,
    color: 'bg-yellow-500',
    tokens: [
      { symbol: 'BNB', name: 'BNB', decimals: 18 },
      { symbol: 'USDT', name: 'Tether USD', decimals: 18 },
      { symbol: 'USDC', name: 'USD Coin', decimals: 18 },
    ]
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    chain: arbitrum,
    color: 'bg-blue-500',
    tokens: [
      { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
    ]
  },
];
