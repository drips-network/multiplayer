import dotenv from 'dotenv';
import { assert } from './assert';
import type { ChainId } from './network';
import shouldNeverHappen from './shouldNeverHappen';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export type NetworkConfig = {
  CHAIN: string;
  ADDRESS_DRIVER: string;
  REPO_DRIVER: string;
};

export const networkConfigs = {
  // Mainnet
  1: {
    CHAIN: 'mainnet',
    ADDRESS_DRIVER: '0x1455d9bD6B98f95dd8FEB2b3D60ed825fcef0610',
    REPO_DRIVER: '0x770023d55D09A9C110694827F1a6B32D5c2b373E',
  },
  // Sepolia
  11155111: {
    CHAIN: 'sepolia',
    ADDRESS_DRIVER: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
    REPO_DRIVER: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
  },
  // Polygon Amoy
  80002: {
    CHAIN: 'amoy',
    ADDRESS_DRIVER: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
    REPO_DRIVER: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
  },
  // Optimism Sepolia
  11155420: {
    CHAIN: 'optimism-sepolia',
    ADDRESS_DRIVER: '0x70E1E1437AeFe8024B6780C94490662b45C3B567',
    REPO_DRIVER: '0xa71bdf410D48d4AA9aE1517A69D7E1Ef0c179b2B',
  },
  // Base Sepolia
  84532: {
    CHAIN: 'base-sepolia',
    ADDRESS_DRIVER: '0x004310a6d47893Dd6e443cbE471c24aDA1e6c619',
    REPO_DRIVER: '0x54372850Db72915Fd9C5EC745683EB607b4a8642',
  },
} as const;

export function getNetworkConfig(
  chainId: ChainId = parseInt(
    process.env.CHAIN_ID || shouldNeverHappen('Missing CHAIN_ID'),
    10,
  ) as ChainId,
): NetworkConfig {
  const config = networkConfigs[chainId];
  assert(config, `No network config found for chainId ${chainId}`);

  return config;
}
