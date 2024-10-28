import dotenv from 'dotenv';
import { z } from 'zod';
import { NETWORK_CONFIG } from './application/network';

dotenv.config();

function missingEnvVar(name: string): never {
  throw new Error(`Missing ${name} in .env file.`);
}

type NetworkNames =
  (typeof NETWORK_CONFIG)[keyof typeof NETWORK_CONFIG]['name'];

const validNetworkNames = Object.values(NETWORK_CONFIG).map(
  (config) => config.name,
);

const RpcConfigSchema = z.record(
  z.enum(validNetworkNames as [NetworkNames]),
  z
    .object({
      url: z.string().url(),
      accessToken: z.string().optional(),
      fallbackUrl: z.string().optional(),
      fallbackAccessToken: z.string().optional(),
    })
    .optional(),
);

const appSettings = {
  port: parseInt(process.env.PORT || '5001', 10),

  postgresConnectionString: process.env.POSTGRES_CONNECTION_STRING,

  logLevel: process.env.LOG_LEVEL || 'info',

  graphQlUrl: process.env.GRAPHQL_URL || missingEnvVar('Missing GraphQL URL.'),
  graphQlAccessToken:
    process.env.GRAPHQL_ACCESS_TOKEN ||
    missingEnvVar('Missing GraphQL access token.'),

  rpcConfig: process.env.RPC_CONFIG
    ? RpcConfigSchema.parse(JSON.parse(process.env.RPC_CONFIG))
    : missingEnvVar('RPC_CONFIG'),

  authStrategy: process.env.AUTH_STRATEGY || 'signature',

  apiKey: process.env.API_KEY,

  dbSchemaName: process.env.DB_SCHEMA_NAME || missingEnvVar('DB_SCHEMA_NAME'),

  shouldRunMigrations:
    (process.env.SHOULD_RUN_MIGRATIONS as unknown as string) === 'true',
};

export default appSettings;
