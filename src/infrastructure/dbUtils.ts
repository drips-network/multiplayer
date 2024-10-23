import { Client } from 'pg';
import path from 'path';
import fs from 'fs';
import appSettings from '../appSettings';
import logger from './logger';
import AppDataSource from './AppDataSource';

export default async function configureDatabase() {
  logger.info('Configuring the database...');

  await createSchemaIfNotExists();

  await AppDataSource.initialize();
  logger.info('DataSource has been initialized.');

  if (appSettings.shouldRunMigrations) {
    logger.info('Run migrations on startup is enabled.');

    await runMigrations();
  }
}

async function createSchemaIfNotExists() {
  logger.info(`Making sure the '${appSettings.network.name}' schema exists...`);

  const client = new Client({
    connectionString: appSettings.postgresConnectionString,
  });

  await client.connect();

  await client.query(
    `CREATE SCHEMA IF NOT EXISTS "${appSettings.network.name}";`,
  );

  await client.end();
}

async function runMigrations() {
  const migrations = await AppDataSource.runMigrations();

  if (migrations.length > 0) {
    logger.info(`Applied migrations:`);
    migrations.forEach((migration) => {
      logger.info(`- ${migration.name}`);
    });
  } else if (!checkMigrationsExist()) {
    logger.warn(
      'No migrations were applied. Did you forget to run "npm run build"?',
    );
  } else {
    logger.info('The database is up to date. No migrations were applied.');
  }
}

function checkMigrationsExist() {
  const migrationPath = path.join(
    __dirname,
    '../../dist/src/infrastructure/migrations',
  );

  if (!fs.existsSync(migrationPath)) {
    return false;
  }

  return true;
}
