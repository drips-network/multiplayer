import dotenv from 'dotenv';
import type { ChainId } from './application/network';
import { getNetwork } from './application/network';

dotenv.config();

function missingEnvVar(name: string): never {
  throw new Error(`Missing ${name} in .env file.`);
}

const appSettings = {
  port: parseInt(process.env.PORT || '5001', 10),

  postgresConnectionString: process.env.POSTGRES_CONNECTION_STRING,

  logLevel: process.env.LOG_LEVEL || 'info',

  graphQlUrl: process.env.GRAPHQL_URL || missingEnvVar('Missing GraphQL URL.'),
  graphQlAccessToken:
    process.env.GRAPHQL_ACCESS_TOKEN ||
    missingEnvVar('Missing GraphQL access token.'),

  rpcUrl: process.env.RPC_URL || missingEnvVar('Missing RPC URL.'),
  rpcUrlAccessToken: process.env.RPC_URL_ACCESS_TOKEN,

  chainId: process.env.CHAIN_ID
    ? (parseInt(process.env.CHAIN_ID, 10) as ChainId)
    : missingEnvVar('Missing chain ID.'),

  authStrategy: process.env.AUTH_STRATEGY || 'signature',

  apiKey: process.env.API_KEY,

  network: getNetwork(
    process.env.CHAIN_ID
      ? (parseInt(process.env.CHAIN_ID, 10) as ChainId)
      : missingEnvVar('Missing chain ID.'),
  ),
};

export default appSettings;
