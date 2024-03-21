import dotenv from 'dotenv';
import shouldNeverHappen from './application/shouldNeverHappen';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const appSettings = {
  apiPort: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV,
  network: process.env.NETWORK,
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
};

export default appSettings;
