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
    './src/application/__generated__/graphql/base-types.ts': {
      plugins: [
        {
          add: {
            content: '/* eslint-disable */',
          },
        },
        'typescript',
      ],
      config: {
        namingConvention: {
          enumValues: 'keep',
        },
      },
    },
  },
};

export default config;
