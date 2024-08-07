import { DataSource } from 'typeorm';
import appSettings from '../appSettings';
import logger from './logger';
import VotingRound from '../domain/votingRoundAggregate/VotingRound';
import Vote from '../domain/votingRoundAggregate/Vote';
import Publisher from '../domain/publisherAggregate/Publisher';
import Link from '../domain/linkedDripList/Link';
import Nomination from '../domain/votingRoundAggregate/Nomination';
import AllowedReceiver from '../domain/allowedReceiver/AllowedReceiver';

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
      entities: [
        VotingRound,
        Vote,
        Publisher,
        Link,
        Nomination,
        AllowedReceiver,
      ],
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
