import { GraphQLClient } from 'graphql-request';
import ApiServer from './ApiServer';
import 'reflect-metadata';
import logger from './infrastructure/logger';
import appSettings from './appSettings';
import { initializeAppDataSource } from './infrastructure/AppDataSource';
import StartVotingRoundEndpoint from './features/startVotingRound/StartVotingRoundEndpoint';
import StartVotingRoundUseCase from './features/startVotingRound/StartVotingRoundUseCase';
import SoftDeleteVotingRoundEndpoint from './features/softDeleteVotingRound/SoftDeleteVotingVotingRoundEndpoint';
import SoftDeleteVotingRoundUseCase from './features/softDeleteVotingRound/SoftDeleteVotingVotingRoundUseCase';
import VotingRoundRepository from './infrastructure/repositories/VotingRoundRepository';
import VotingRoundService from './domain/services/VotingRoundService';
import CollaboratorRepository from './infrastructure/repositories/CollaboratorRepository';
import GetVotingRoundByIdEndpoint from './features/getVotingRoundById/GetVotingRoundByIdEndpoint';
import GetVotingRoundByIdUseCase from './features/getVotingRoundById/GetVotingRoundByIdUseCase';
import CastVoteEndpoint from './features/castVote/CastVoteEndpoint';
import CastVoteUseCase from './features/castVote/CastVoteUseCase';
import PublisherRepository from './infrastructure/repositories/PublisherRepository';
import GetVotingRoundsEndpoint from './features/getVotingRounds/GetVotingRoundsEndpoint';
import GetVotingRoundsUseCase from './features/getVotingRounds/GetVotingRoundsUseCase';
import LinkEndpoint from './features/link/LinkEndpoint';
import LinkUseCase from './features/link/LinkUseCase';
import GetVotingRoundResultEndpoint from './features/getVotingRoundResult/GetVotingRoundResultEndpoint';
import GetVotingRoundResultUseCase from './features/getVotingRoundResult/GetVotingRoundResultUseCase';
import GetVotingRoundVotesEndpoint from './features/getVotingRoundVotes/GetVotingRoundVotesEndpoint';
import GetVotingRoundVotesUseCase from './features/getVotingRoundVotes/GetVotingRoundVotesUseCase';
import Auth from './application/Auth';
import {
  AddressDriver__factory,
  RepoDriver__factory,
} from './generated/contracts';
import IsVoterEndpoint from './features/isVoter/IsVoterEndpoint';
import IsVoterUseCase from './features/isVoter/IsVoterUseCase';
import provider from './application/provider';

export async function main(): Promise<void> {
  logger.info('Starting the application...');
  logger.info(`App Settings: ${JSON.stringify(appSettings, null, 2)}`);

  const AppDataSource = await initializeAppDataSource();

  const publisherRepository = new PublisherRepository(AppDataSource);
  const votingRoundRepository = new VotingRoundRepository(AppDataSource);
  const collaboratorRepository = new CollaboratorRepository(AppDataSource);

  const votingRoundService = new VotingRoundService(
    publisherRepository,
    votingRoundRepository,
    collaboratorRepository,
  );

  const auth = new Auth(
    logger,
    new GraphQLClient(appSettings.graphQlUrl, {
      headers: {
        authorization: `Bearer ${appSettings.graphQlToken}`,
      },
    }),
    votingRoundRepository,
  );

  const startVotingRoundEndpoint = new StartVotingRoundEndpoint(
    new StartVotingRoundUseCase(logger, votingRoundService),
  );
  const softDeleteVotingRoundEndpoint = new SoftDeleteVotingRoundEndpoint(
    new SoftDeleteVotingRoundUseCase(logger, votingRoundRepository),
  );
  const getVotingRoundByIdEndpoint = new GetVotingRoundByIdEndpoint(
    new GetVotingRoundByIdUseCase(votingRoundRepository),
  );

  const isVoterEndpoint = new IsVoterEndpoint(
    new IsVoterUseCase(votingRoundRepository),
  );

  const castVoteEndpoint = new CastVoteEndpoint(
    new CastVoteUseCase(
      logger,
      votingRoundRepository,
      collaboratorRepository,
      RepoDriver__factory.connect(appSettings.repoDriverAddress, provider),
      AddressDriver__factory.connect(
        appSettings.addressDriverAddress,
        provider,
      ),
    ),
  );
  const getVotingRoundsEndpoint = new GetVotingRoundsEndpoint(
    new GetVotingRoundsUseCase(votingRoundRepository),
  );
  const linkEndpoint = new LinkEndpoint(
    new LinkUseCase(logger, votingRoundRepository, auth),
  );
  const getVotingRoundVotesEndpoint = new GetVotingRoundVotesEndpoint(
    new GetVotingRoundVotesUseCase(votingRoundRepository, logger),
  );
  const getVotingRoundResultEndpoint = new GetVotingRoundResultEndpoint(
    new GetVotingRoundResultUseCase(votingRoundRepository, logger),
  );

  await ApiServer.run(
    [
      startVotingRoundEndpoint,
      softDeleteVotingRoundEndpoint,
      getVotingRoundByIdEndpoint,
      castVoteEndpoint,
      getVotingRoundsEndpoint,
      linkEndpoint,
      getVotingRoundVotesEndpoint,
      getVotingRoundResultEndpoint,
      isVoterEndpoint,
    ],
    appSettings.port,
  );
}

(async () => {
  await main();
})();

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message} ${error.stack}`);
});
