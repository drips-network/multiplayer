import { DataSource } from 'typeorm';
import appSettings from '../appSettings';
import VotingRound from '../domain/votingRoundAggregate/VotingRound';
import Vote from '../domain/votingRoundAggregate/Vote';
import Publisher from '../domain/publisherAggregate/Publisher';
import Link from '../domain/linkedDripList/Link';
import Nomination from '../domain/votingRoundAggregate/Nomination';
import AllowedReceiver from '../domain/allowedReceiver/AllowedReceiver';

const { dbHost, dbPort, dbUser, dbPassword, dbName, network } = appSettings;

const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUser,
  password: dbPassword,
  database: dbName,
  entities: [VotingRound, Vote, Publisher, Link, Nomination, AllowedReceiver],
  synchronize: false,
  logging: false,
  schema: network,
});

export default AppDataSource;
