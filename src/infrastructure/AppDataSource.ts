import { DataSource } from 'typeorm';
import { VotingRound } from '../domain/VotingRound';
import appSettings from '../appSettings';
import logger from './logger';

const { dbHost, dbPort, dbUser, dbPassword, dbName, network } = appSettings;

const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
  entities: [VotingRound],
  synchronize: true,
  logging: false,
  schema: appSettings.network,
});

AppDataSource.initialize()
  .then(async () => {
    await AppDataSource.query(`CREATE SCHEMA IF NOT EXISTS ${network}`);
  })
  .catch((error) => logger.error(error));

export default AppDataSource;
