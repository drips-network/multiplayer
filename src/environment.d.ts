declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      RPC_CONFIG: string;
      DB_SCHEMA_NAME: string;
      SHOULD_RUN_MIGRATIONS: boolean;
      POSTGRES_CONNECTION_STRING: string;
      LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
      GRAPHQL_URL: string;
      GRAPHQL_ACCESS_TOKEN: string;
      PRIMARY_RPC_URL: string;
      PRIMARY_RPC_ACCESS_TOKEN: string | undefined;
      FALLBACK_RPC_URL: string | undefined;
      FALLBACK_RPC_ACCESS_TOKEN: string | undefined;
      AUTH_STRATEGY: 'signature' | 'dev';
      API_KEY: string;
    }
  }
}

export {};
