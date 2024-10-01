import { SupportedChain } from './__generated__/graphql/base-types';

export const SUPPORTED_CHAIN_IDS = [
  1, 80002, 11155420, 11155111, 84532, 314,
] as const;
export type ChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

type NetworkName =
  | 'mainnet'
  | 'polygon-amoy'
  | 'optimism-sepolia'
  | 'base-sepolia'
  | 'sepolia'
  | 'filecoin';

export type Network = {
  chainId: ChainId;
  name: NetworkName;
  gqlName: SupportedChain;
  contracts: {
    dripsAddress: string;
    addressDriverAddress: string;
    repoDriverAddress: string;
  };
};

export type ValueForEachSupportedChain<T> = Record<
  (typeof SUPPORTED_CHAIN_IDS)[number],
  T
>;

const NETWORK_NAMES: ValueForEachSupportedChain<NetworkName> = {
  1: 'mainnet',
  80002: 'polygon-amoy',
  11155420: 'optimism-sepolia',
  11155111: 'sepolia',
  84532: 'base-sepolia',
  314: 'filecoin',
};

const NETWORK_GQL_NAMES: ValueForEachSupportedChain<SupportedChain> = {
  1: SupportedChain.Mainnet,
  80002: SupportedChain.PolygonAmoy,
  11155420: SupportedChain.OptimismSepolia,
  11155111: SupportedChain.Sepolia,
  84532: SupportedChain.BaseSepolia,
  314: SupportedChain.Filecoin,
};

const NETWORK_CONTRACTS: ValueForEachSupportedChain<{
  dripsAddress: string;
  addressDriverAddress: string;
  repoDriverAddress: string;
}> = {
  1: {
    dripsAddress: '0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4',
    addressDriverAddress: '0x1455d9bD6B98f95dd8FEB2b3D60ed825fcef0610',
    repoDriverAddress: '0x770023d55D09A9C110694827F1a6B32D5c2b373E',
  },
  11155111: {
    dripsAddress: '0x74A32a38D945b9527524900429b083547DeB9bF4',
    addressDriverAddress: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
    repoDriverAddress: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
  },
  11155420: {
    dripsAddress: '0x74A32a38D945b9527524900429b083547DeB9bF4',
    addressDriverAddress: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
    repoDriverAddress: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
  },
  80002: {
    dripsAddress: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
    addressDriverAddress: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
    repoDriverAddress: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
  },
  84532: {
    dripsAddress: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
    addressDriverAddress: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
    repoDriverAddress: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
  },
  314: {
    dripsAddress: '0x0B71C2a08d27E86d3841A6772332DEde0bc8DCa5',
    addressDriverAddress: '0xEFcd912a5a67C3a7Cc70a2Fb9aa17781bf1cE68F',
    repoDriverAddress: '0xf3aE6ADDeEE195e91380F5F9Ce73698460BAdf79',
  },
};

export function getNetwork(chainId: ChainId): Network {
  if (!SUPPORTED_CHAIN_IDS.includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  return {
    chainId,
    name: NETWORK_NAMES[chainId],
    gqlName: NETWORK_GQL_NAMES[chainId],
    contracts: NETWORK_CONTRACTS[chainId],
  };
}

export const SAFE_UNSUPPORTED_NETWORKS: NetworkName[] = [
  'optimism-sepolia',
  'polygon-amoy',
] as const;
