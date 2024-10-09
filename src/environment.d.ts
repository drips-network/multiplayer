declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      CHAIN_ID: string;
      POSTGRES_CONNECTION_STRING: string;
      LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
      GRAPHQL_URL: string;
      GRAPHQL_ACCESS_TOKEN: string;
      RPC_URL: string;
      RPC_URL_ACCESS_TOKEN: string | undefined;
      AUTH_STRATEGY: 'signature' | 'dev';
      API_KEY: string;
    }
  }
}

export {};
