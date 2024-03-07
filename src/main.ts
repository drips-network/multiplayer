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
import SetCollaboratorsEndpoint from './features/setCollaborators/SetCollaboratorsEndpoint';
import SetCollaboratorsUseCase from './features/setCollaborators/SetCollaboratorsUseCase';
import VotingRoundService from './domain/services/VotingRoundService';
import CollaboratorRepository from './infrastructure/repositories/CollaboratorRepository';
import GetVotingRoundByIdEndpoint from './features/getVotingRoundById/GetVotingRoundByIdEndpoint';
import GetVotingRoundByIdUseCase from './features/getVotingRoundById/GetVotingRoundByIdUseCase';
import CastVoteEndpoint from './features/castVote/CastVoteEndpoint';
import CastVoteUseCase from './features/castVote/CastVoteUseCase';
import PublisherRepository from './infrastructure/repositories/PublisherRepository';

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
  const setCollaboratorsEndpoint = new SetCollaboratorsEndpoint(
    new SetCollaboratorsUseCase(
      logger,
      votingRoundService,
      votingRoundRepository,
    ),
  );
  const getVotingRoundById = new GetVotingRoundByIdEndpoint(
    new GetVotingRoundByIdUseCase(votingRoundRepository),
  );
  const castVoteEndpoint = new CastVoteEndpoint(
    new CastVoteUseCase(logger, votingRoundRepository, collaboratorRepository),
  );

  await ApiServer.run(
    [
      startVotingRoundEndpoint,
      softDeleteVotingRoundEndpoint,
      setCollaboratorsEndpoint,
      getVotingRoundById,
      castVoteEndpoint,
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
