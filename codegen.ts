import 'dotenv/config';
import type { CodegenConfig } from '@graphql-codegen/cli';
import appSettings from './src/appSettings';

const config: CodegenConfig = {
  schema: [
    {
      [appSettings.graphQlUrl]: {
        headers: {
          Authorization: `Bearer ${appSettings.graphQlAccessToken}`,
        },
      },
    },
  ],
  generates: {
    './src/application/__generated__/graphql/schema.graphql': {
      plugins: ['schema-ast'],
    },
    './src/application/__generated__/graphql/base-types.ts': {
      plugins: ['typescript'],
    },
  },
};

export default config;
