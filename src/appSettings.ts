import dotenv from 'dotenv';
import { networks } from './application/networks';

dotenv.config();

function missingEnvVar(name: string): never {
  throw new Error(`Missing ${name} in .env file.`);
}

const appSettings = {
  port: parseInt(process.env.PORT || '5001', 10),
  network: process.env.NETWORK,

  postgresConnectionString: process.env.POSTGRES_CONNECTION_STRING,

  logLevel: process.env.LOG_LEVEL || 'info',

  graphQlUrl: process.env.GRAPHQL_URL || missingEnvVar('Missing GraphQL URL.'),
  graphQlAccessToken:
    process.env.GRAPHQL_ACCESS_TOKEN ||
    missingEnvVar('Missing GraphQL access token.'),

  rpcUrl: process.env.RPC_URL || missingEnvVar('Missing RPC URL.'),

  chainId: networks[process.env.NETWORK as keyof typeof networks],

  addressDriverAddress:
    process.env.ADDRESS_DRIVER_ADDRESS ||
    missingEnvVar(`Missing 'AddressDriver' address.`),
  repoDriverAddress:
    process.env.REPO_DRIVER_ADDRESS ||
    missingEnvVar(`Missing 'RepoDriver' address.`),

  authStrategy: process.env.AUTH_STRATEGY || 'signature',

  apiKey: process.env.API_KEY,
};

export default appSettings;
