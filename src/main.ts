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
import PublishEndpoint from './features/publish/PublishEndpoint';
import PublishUseCase from './features/publish/PublishUseCase';

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

  const startVotingRoundEndpoint = new StartVotingRoundEndpoint(
    new StartVotingRoundUseCase(logger, votingRoundService),
  );
  const softDeleteVotingRoundEndpoint = new SoftDeleteVotingRoundEndpoint(
    new SoftDeleteVotingRoundUseCase(logger, votingRoundRepository),
  );
  const getVotingRoundByIdEndpoint = new GetVotingRoundByIdEndpoint(
    new GetVotingRoundByIdUseCase(votingRoundRepository),
  );
  const castVoteEndpoint = new CastVoteEndpoint(
    new CastVoteUseCase(logger, votingRoundRepository, collaboratorRepository),
  );
  const getVotingRoundsEndpoint = new GetVotingRoundsEndpoint(
    new GetVotingRoundsUseCase(votingRoundRepository),
  );
  const publishEndpoint = new PublishEndpoint(new PublishUseCase(logger));

  await ApiServer.run(
    [
      startVotingRoundEndpoint,
      softDeleteVotingRoundEndpoint,
      getVotingRoundByIdEndpoint,
      castVoteEndpoint,
      getVotingRoundsEndpoint,
      publishEndpoint,
    ],
    appSettings.apiPort,
  );
}

(async () => {
  await main();
})();

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
});
