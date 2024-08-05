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
import type { IAuthStrategy } from './application/Auth';
import { Auth, DevAuth } from './application/Auth';
import ReceiverMapper from './application/ReceiverMapper';
import NominateEndpoint from './features/nominate/NominateEndpoint';
import NominateUseCase from './features/nominate/NominateUseCase';
import GetCollaboratorByAddressEndpoint from './features/getCollaboratorByAddress/GetCollaboratorByAddressEndpoint';
import GetCollaboratorByAddressUseCase from './features/getCollaboratorByAddress/GetCollaboratorByAddressUseCase';
import SetNominationsStatusesEndpoint from './features/setNominationsStatuses/SetNominationsStatusesEndpoint';
import SetNominationsStatusesUseCase from './features/setNominationsStatuses/SetNominationsStatusesUseCase';
import VotingRoundMapper from './application/VotingRoundMapper';
import SafeService from './application/SafeService';
import {
  SafeAdapter,
  UnsupportedSafeOperationsAdapter,
} from './application/SafeAdapter';
import type ISafeAdapter from './application/interfaces/ISafeAdapter';
import AllowedReceiversRepository from './infrastructure/repositories/AllowedReceiversRepository';
import { isSafeUnsupportedNetwork } from './application/network';
import {
  executeAddressDriverReadMethod,
  executeRepoDriverReadMethod,
} from './application/contractClients/contractClients';

export async function main(): Promise<void> {
  logger.info('Starting the application...');
  logger.info(`App Settings: ${JSON.stringify(appSettings, null, 2)}`);

  const AppDataSource = await initializeAppDataSource();

  const publisherRepository = new PublisherRepository(AppDataSource);
  const votingRoundRepository = new VotingRoundRepository(AppDataSource);
  const collaboratorRepository = new CollaboratorRepository(AppDataSource);
  const allowedReceiversRepository = new AllowedReceiversRepository(
    AppDataSource,
  );

  const votingRoundService = new VotingRoundService(
    publisherRepository,
    votingRoundRepository,
    collaboratorRepository,
    allowedReceiversRepository,
  );

  const graphQlClient = new GraphQLClient(appSettings.graphQlUrl, {
    headers: {
      authorization: `Bearer ${appSettings.graphQlToken}`,
    },
  });

  let safeAdapter: ISafeAdapter;
  if (isSafeUnsupportedNetwork(appSettings.network.chainId)) {
    safeAdapter = new UnsupportedSafeOperationsAdapter();
  } else {
    safeAdapter = new SafeAdapter();
  }

  let auth: IAuthStrategy;
  if (appSettings.authStrategy === 'dev') {
    auth = new DevAuth();
  } else if (appSettings.authStrategy === 'signature') {
    auth = new Auth(logger, graphQlClient, safeAdapter);
  } else {
    throw new Error(`Unknown auth strategy: ${appSettings.authStrategy}`);
  }
  if (appSettings.authStrategy !== 'signature') {
    logger.warn('⛔️ AUTHENTICATION IS DISABLED ⛔️');
  }

  const safeService = new SafeService(
    graphQlClient,
    auth,
    votingRoundRepository,
    safeAdapter,
    logger,
  );

  const receiverMapper = new ReceiverMapper(
    executeRepoDriverReadMethod,
    executeAddressDriverReadMethod,
  );

  const votingRoundMapper = new VotingRoundMapper(receiverMapper);

  const startVotingRoundEndpoint = new StartVotingRoundEndpoint(
    new StartVotingRoundUseCase(
      logger,
      votingRoundService,
      auth,
      receiverMapper,
    ),
  );
  const softDeleteVotingRoundEndpoint = new SoftDeleteVotingRoundEndpoint(
    new SoftDeleteVotingRoundUseCase(logger, votingRoundRepository, auth),
  );
  const getVotingRoundByIdEndpoint = new GetVotingRoundByIdEndpoint(
    new GetVotingRoundByIdUseCase(
      votingRoundRepository,
      votingRoundMapper,
      safeService,
    ),
  );

  const getCollaboratorByAddressEndpoint = new GetCollaboratorByAddressEndpoint(
    new GetCollaboratorByAddressUseCase(
      votingRoundRepository,
      auth,
      receiverMapper,
    ),
  );

  const castVoteEndpoint = new CastVoteEndpoint(
    new CastVoteUseCase(
      logger,
      votingRoundRepository,
      collaboratorRepository,
      receiverMapper,
      auth,
    ),
  );

  const getVotingRoundsEndpoint = new GetVotingRoundsEndpoint(
    new GetVotingRoundsUseCase(
      votingRoundRepository,
      votingRoundMapper,
      safeService,
    ),
  );

  const linkEndpoint = new LinkEndpoint(
    new LinkUseCase(logger, votingRoundRepository, safeService),
  );

  const getVotingRoundVotesEndpoint = new GetVotingRoundVotesEndpoint(
    new GetVotingRoundVotesUseCase(
      votingRoundRepository,
      logger,
      receiverMapper,
      auth,
    ),
  );

  const getVotingRoundResultEndpoint = new GetVotingRoundResultEndpoint(
    new GetVotingRoundResultUseCase(
      votingRoundRepository,
      logger,
      receiverMapper,
      auth,
    ),
  );

  const nominateEndpoint = new NominateEndpoint(
    new NominateUseCase(logger, votingRoundRepository, receiverMapper, auth),
  );

  const setNominationsStatusesEndpoint = new SetNominationsStatusesEndpoint(
    new SetNominationsStatusesUseCase(logger, votingRoundRepository, auth),
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
      nominateEndpoint,
      setNominationsStatusesEndpoint,
      getCollaboratorByAddressEndpoint,
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
