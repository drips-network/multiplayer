declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'local' | 'goerli' | 'mainnet';
      PORT: string;
      CHAIN_ID: '1' | '80002' | '11155420' | '11155111' | '84532';
      DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
      GRAPHQL_URL: string;
      GRAPHQL_TOKEN: string;
      RPC_URL: string;
      AUTH_STRATEGY: 'signature' | 'dev';
      API_KEY: string;
    }
  }
}

export {};
