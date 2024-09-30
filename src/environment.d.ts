declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CHAIN_ID: string;
      PORT: string;
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
