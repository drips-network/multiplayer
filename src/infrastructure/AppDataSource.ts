import { DataSource } from 'typeorm';
import { VotingRound } from '../domain/VotingRound';
import appSettings from '../appSettings';
import logger from './logger';
import Collaborator from '../domain/Collaborator';
import { DraftDripList } from '../domain/DraftDripList';

export async function initializeAppDataSource() {
  try {
    const { dbHost, dbPort, dbUser, dbPassword, dbName, network } = appSettings;

    const AppDataSource = new DataSource({
      type: 'postgres',
      host: dbHost,
      port: dbPort,
      username: dbUser,
      password: dbPassword,
      database: dbName,
      entities: [DraftDripList, Collaborator, VotingRound],
      synchronize: true,
      logging: false,
      schema: network,
    });

    await AppDataSource.initialize();

    logger.info('Connected to the database.');
    // await AppDataSource.query(`CREATE SCHEMA IF NOT EXISTS ${network}`);

    return AppDataSource;
  } catch (error: any) {
    throw new Error(error);
  }
}
