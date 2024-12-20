import { DataSource } from 'typeorm';
import appSettings from '../appSettings';
import VotingRound from '../domain/votingRoundAggregate/VotingRound';
import Vote from '../domain/votingRoundAggregate/Vote';
import Publisher from '../domain/publisherAggregate/Publisher';
import Link from '../domain/linkedDripList/Link';
import Nomination from '../domain/votingRoundAggregate/Nomination';
import AllowedReceiver from '../domain/allowedReceiver/AllowedReceiver';

const { postgresConnectionString, dbSchemaName } = appSettings;

const AppDataSource = new DataSource({
  url: postgresConnectionString,
  type: 'postgres',
  entities: [VotingRound, Vote, Publisher, Link, Nomination, AllowedReceiver],
  synchronize: false,
  logging: false,
  schema: dbSchemaName,
  migrationsTableName: '_Migrations',
  migrations: ['dist/src/infrastructure/migrations/*.js'],
});

export default AppDataSource;
