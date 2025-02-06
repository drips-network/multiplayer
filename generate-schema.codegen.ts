import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';
import shouldNeverHappen from './src/application/shouldNeverHappen';

if (!process.env.GRAPHQL_ACCESS_TOKEN || !process.env.GRAPHQL_URL) {
  throw new Error(
    `In order to build GraphQL types, you must provide GRAPHQL_URL and GRAPHQL_ACCESS_TOKEN env vars for the Drips GraphQL API.`,
  );
}

const config: CodegenConfig = {
  schema: [
    {
      [process.env.GRAPHQL_URL ?? shouldNeverHappen()]: {
        headers: {
          Authorization: `Bearer ${process.env.GRAPHQL_ACCESS_TOKEN}`,
        },
      },
    },
  ],
  generates: {
    './schema.graphql': {
      plugins: ['schema-ast'],
    },
  },
};

export default config;
