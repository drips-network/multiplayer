import dotenv from 'dotenv';
import { assert } from './assert';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export type Network = {
  chainId: ChainId;
  name: string;
};

const SUPPORTED_CHAIN_IDS = [1, 80002, 11155420, 11155111, 84532] as const;
export type ChainId = (typeof SUPPORTED_CHAIN_IDS)[number];

export type ValueForEachSupportedChain<T> = Record<
  (typeof SUPPORTED_CHAIN_IDS)[number],
  T
>;

const NETWORK_NAMES: ValueForEachSupportedChain<string> = {
  1: 'mainnet',
  80002: 'polygon_amoy',
  11155420: 'optimism_sepolia',
  11155111: 'sepolia',
  84532: 'base_sepolia',
};

export function isSupportedChainId(chainId: number): chainId is ChainId {
  return SUPPORTED_CHAIN_IDS.includes(chainId as ChainId);
}

export function isSafeUnsupportedNetwork(chainId: number): chainId is ChainId {
  return [11155420, 80002].includes(chainId as ChainId);
}

const configuredChainId = Number(process.env.CHAIN_ID);
assert(
  isSupportedChainId(configuredChainId),
  'Missing or invalid CHAIN_ID env variable.',
);

export function getNetwork(chainId: ChainId): Network {
  assert(isSupportedChainId(chainId), 'Unsupported chain id');

  return {
    chainId,
    name: NETWORK_NAMES[chainId],
  };
}

export default getNetwork(configuredChainId);
