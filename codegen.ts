import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    {
      [process.env.GRAPHQL_URL]: {
        headers: {
          Authorization: `Bearer ${process.env.GRAPHQL_ACCESS_TOKEN}`,
        },
      },
    },
  ],
  generates: {
    './src/application/__generated__/graphql/base-types.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        namingConvention: {
          enumValues: 'keep',
        },
      },
    },
  },
};

export default config;
