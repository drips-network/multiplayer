import dotenv from 'dotenv';
import shouldNeverHappen from './application/shouldNeverHappen';
import { networks } from './application/networks';

dotenv.config({ path: `.env.${process.env.ENV || 'testing'}` });

const appSettings = {
  env: process.env.ENV || 'testing',
  port: parseInt(process.env.PORT || '5001', 10),
  network: process.env.NETWORK,

  dbHost: process.env.DB_HOST || shouldNeverHappen('Missing database host.'),
  dbPort: parseInt(
    process.env.DB_PORT || shouldNeverHappen('Missing database port.'),
    10,
  ),
  dbUser: process.env.DB_USER || shouldNeverHappen('Missing database user.'),
  dbPassword:
    process.env.DB_PASSWORD || shouldNeverHappen('Missing database password.'),
  dbName: process.env.DB_NAME,

  logLevel: process.env.LOG_LEVEL || 'info',

  graphQlUrl:
    process.env.GRAPHQL_URL || shouldNeverHappen('Missing GraphQL URL.'),
  graphQlToken:
    process.env.GRAPHQL_TOKEN || shouldNeverHappen('Missing token.'),

  rpcUrl: process.env.RPC_URL || shouldNeverHappen('Missing RPC URL.'),

  chainId: networks[process.env.NETWORK as keyof typeof networks],

  addressDriverAddress:
    process.env.ADDRESS_DRIVER_ADDRESS ||
    shouldNeverHappen(`Missing 'AddressDriver' address.`),
  repoDriverAddress:
    process.env.REPO_DRIVER_ADDRESS ||
    shouldNeverHappen(`Missing 'RepoDriver' address.`),

  authStrategy: process.env.AUTH_STRATEGY || 'signature',

  apiKey: process.env.API_KEY,
};

export default appSettings;
