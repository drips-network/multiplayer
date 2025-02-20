import { SupportedChain } from './__generated__/graphql/base-types';
import { assert } from './assert';

export const SUPPORTED_CHAIN_IDS = [
  1, 80002, 11155420, 11155111, 84532, 314, 31337, 1088, 10,
] as const;
export type ChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

type NetworkName =
  | 'mainnet'
  | 'polygon-amoy'
  | 'optimism-sepolia'
  | 'base-sepolia'
  | 'sepolia'
  | 'filecoin'
  | 'localtestnet'
  | 'metis'
  | 'optimism';

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

export const NETWORK_CONFIG: ValueForEachSupportedChain<Network> = {
  1: {
    chainId: 1,
    name: 'mainnet',
    gqlName: SupportedChain.MAINNET,
    contracts: {
      dripsAddress: '0xd0Dd053392db676D57317CD4fe96Fc2cCf42D0b4',
      addressDriverAddress: '0x1455d9bD6B98f95dd8FEB2b3D60ed825fcef0610',
      repoDriverAddress: '0x770023d55D09A9C110694827F1a6B32D5c2b373E',
    },
  },
  11155111: {
    chainId: 11155111,
    name: 'sepolia',
    gqlName: SupportedChain.SEPOLIA,
    contracts: {
      dripsAddress: '0x74A32a38D945b9527524900429b083547DeB9bF4',
      addressDriverAddress: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
      repoDriverAddress: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
    },
  },
  11155420: {
    chainId: 11155420,
    name: 'optimism-sepolia',
    gqlName: SupportedChain.OPTIMISM_SEPOLIA,
    contracts: {
      dripsAddress: '0x74A32a38D945b9527524900429b083547DeB9bF4',
      addressDriverAddress: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
      repoDriverAddress: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
    },
  },
  80002: {
    chainId: 80002,
    name: 'polygon-amoy',
    gqlName: SupportedChain.POLYGON_AMOY,
    contracts: {
      dripsAddress: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
      addressDriverAddress: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
      repoDriverAddress: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
    },
  },
  84532: {
    chainId: 84532,
    name: 'base-sepolia',
    gqlName: SupportedChain.BASE_SEPOLIA,
    contracts: {
      dripsAddress: '0xeebCd570e50fa31bcf6eF10f989429C87C3A6981',
      addressDriverAddress: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
      repoDriverAddress: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
    },
  },
  314: {
    chainId: 314,
    name: 'filecoin',
    gqlName: SupportedChain.FILECOIN,
    contracts: {
      dripsAddress: '0xd320F59F109c618b19707ea5C5F068020eA333B3',
      addressDriverAddress: '0x04693D13826a37dDdF973Be4275546Ad978cb9EE',
      repoDriverAddress: '0xe75f56B26857cAe06b455Bfc9481593Ae0FB4257',
    },
  },
  31337: {
    chainId: 31337,
    name: 'localtestnet',
    gqlName: SupportedChain.LOCALTESTNET,
    contracts: {
      dripsAddress: '0x7CBbD3FdF9E5eb359E6D9B12848c5Faa81629944',
      addressDriverAddress: '0x1707De7b41A3915F990A663d27AD3a952D50151d',
      repoDriverAddress: '0x971e08fc533d2A5f228c7944E511611dA3B56B24',
    },
  },
  1088: {
    chainId: 1088,
    name: 'metis',
    gqlName: SupportedChain.METIS,
    contracts: {
      dripsAddress: '0xd320F59F109c618b19707ea5C5F068020eA333B3',
      addressDriverAddress: '0x04693D13826a37dDdF973Be4275546Ad978cb9EE',
      repoDriverAddress: '0xe75f56B26857cAe06b455Bfc9481593Ae0FB4257',
    },
  },
  10: {
    chainId: 10,
    name: 'optimism',
    gqlName: SupportedChain.OPTIMISM,
    contracts: {
      dripsAddress: '0xd320F59F109c618b19707ea5C5F068020eA333B3',
      addressDriverAddress: '0x04693D13826a37dDdF973Be4275546Ad978cb9EE',
      repoDriverAddress: '0xe75f56B26857cAe06b455Bfc9481593Ae0FB4257',
    },
  },
};

export function isSupportedChainId(chainId: number): chainId is ChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as ChainId);
}

export function getNetwork(chainId: ChainId): Network {
  assert(isSupportedChainId(chainId), `Unsupported chain ID '${chainId}'.`);

  return NETWORK_CONFIG[chainId];
}

export const SAFE_UNSUPPORTED_NETWORKS: NetworkName[] = [
  'optimism-sepolia',
  'polygon-amoy',
] as const;
