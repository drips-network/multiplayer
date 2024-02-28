import { DataSource } from 'typeorm';
import appSettings from '../appSettings';
import logger from './logger';
import DraftDripList from '../domain/draftDripListAggregate/DraftDripList';
import Publisher from '../domain/draftDripListAggregate/Publisher';
import VotingRound from '../domain/draftDripListAggregate/VotingRound';
import Collaborator from '../domain/draftDripListAggregate/Collaborator';

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
      entities: [DraftDripList, Publisher, VotingRound, Collaborator],
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
