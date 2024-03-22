declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'goerli' | 'mainnet';
      PORT: string;
      NETWORK: 'sepolia' | 'mainnet';
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
      GRAPHQL_URL: string;
      GRAPHQL_TOKEN: string;
      RPC_URL: string;
      ADDRESS_DRIVER_ADDRESS: string;
      REPO_DRIVER_ADDRESS: string;
    }
  }
}

export {};
