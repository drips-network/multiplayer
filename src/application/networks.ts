export const networks = {
  mainnet: 1,
  goerli: 5,
  sepolia: 11155111,
  'optimism-sepolia': 11155420,
  'polygon-amoy': 80002,
} as const;

export const safeUnsupportedNetworks = [
  'optimism-sepolia',
  'polygon-amoy',
] as const;
