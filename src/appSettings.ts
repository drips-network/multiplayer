import dotenv from 'dotenv';
import shouldNeverHappen from './application/shouldNeverHappen';
import type { ChainId } from './application/network';
import { getNetwork } from './application/network';
import { getNetworkConfig } from './application/networkConfig';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const appSettings = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV,
  dbHost: process.env.DB_HOST,
  dbPort: parseInt(
    process.env.DB_PORT || shouldNeverHappen('Missing database port.'),
    10,
  ),
  dbUser: process.env.DB_USER,
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  logLevel: process.env.LOG_LEVEL || 'info',
  graphQlUrl: (() => {
    if (
      process.env.NODE_ENV !== 'local' &&
      !process.env.NODE_ENV!.includes(process.env.NODE_ENV!)
    ) {
      throw new Error(
        '`NODE_ENV` and `GRAPHQL_URL` mismatch. Check your `.env` file.',
      );
    }

    return process.env.GRAPHQL_URL || shouldNeverHappen('Missing GraphQL URL.');
  })(),
  graphQlToken: process.env.GRAPHQL_TOKEN,
  rpcUrl: process.env.RPC_URL,
  network: getNetwork(
    parseInt(
      process.env.CHAIN_ID || shouldNeverHappen('Missing CHAIN_ID'),
      10,
    ) as ChainId,
  ),
  networkConfig: getNetworkConfig(
    parseInt(
      process.env.CHAIN_ID || shouldNeverHappen('Missing CHAIN_ID'),
      10,
    ) as ChainId,
  ),
  authStrategy: process.env.AUTH_STRATEGY || 'signature',
  apiKey: process.env.API_KEY,
};

export default appSettings;
