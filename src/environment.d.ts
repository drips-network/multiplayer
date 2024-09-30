export const SUPPORTED_NETWORKS = [
  'mainnet',
  'sepolia',
  'localtestnet',
  'optimism_sepolia',
  'polygon_amoy',
  'filecoin',
] as const;

export type SupportedNetwork = (typeof SUPPORTED_NETWORKS)[number];

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NETWORK: SupportedNetwork;
      POSTGRES_CONNECTION_STRING: string;
      LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
      GRAPHQL_URL: string;
      GQL_ACCESS_TOKEN: string;
      RPC_URL: string;
      ADDRESS_DRIVER_ADDRESS: string;
      REPO_DRIVER_ADDRESS: string;
      AUTH_STRATEGY: 'signature' | 'dev';
      API_KEY: string;
    }
  }
}

export {};
