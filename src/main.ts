import ApiServer from './ApiServer';
import 'reflect-metadata';
import logger from './infrastructure/logger';
import appSettings from './appSettings';
import { initializeAppDataSource } from './infrastructure/AppDataSource';
import CreateDraftDripListEndpoint from './features/createDraftDripList/CreateDraftDripListEndpoint';
import CreateDraftDripListUseCase from './features/createDraftDripList/CreateDraftDripListUseCase';
import DeleteDraftDripListEndpoint from './features/deleteDraftDripList/DeleteDraftDripListEndpoint';
import DeleteDraftDripListUseCase from './features/deleteDraftDripList/DeleteDraftDripListUseCase';
import GetDraftDripListByIdEndpoint from './features/getDraftDripListById/GetDraftDripListByIdEndpoint';
import GetDraftDripListByIdUseCase from './features/getDraftDripListById/GetDraftDripListByIdUseCase';
import StartVotingRoundEndpoint from './features/startVotingRound/StartVotingRoundEndpoint';
import StartVotingRoundUseCase from './features/startVotingRound/StartVotingRoundUseCase';
import DeleteCurrentVotingRoundEndpoint from './features/deleteCurrentVotingRound/DeleteCurrentVotingVotingRoundEndpoint';
import DeleteCurrentVotingRoundUseCase from './features/deleteCurrentVotingRound/DeleteCurrentVotingVotingRoundUseCase';
import DraftDripListRepository from './infrastructure/repositories/DraftDripListRepository';
import VotingRoundRepository from './infrastructure/repositories/VotingRoundRepository';
import SetCollaboratorsEndpoint from './features/setCollaborators/SetCollaboratorsEndpoint';
import SetCollaboratorsUseCase from './features/setCollaborators/SetCollaboratorsUseCase';
import VotingRoundService from './domain/services/VotingRoundService';
import CollaboratorRepository from './infrastructure/repositories/CollaboratorRepository';
import GetVotingRoundByIdEndpoint from './features/getVotingRoundById/GetVotingRoundByIdEndpoint';
import GetVotingRoundByIdUseCase from './features/getVotingRoundById/GetVotingRoundByIdUseCase';
import CastVoteEndpoint from './features/castVote/CastVoteEndpoint';
import CastVoteUseCase from './features/castVote/CastVoteUseCase';

export async function main(): Promise<void> {
  logger.info('Starting the application...');
  logger.info(`App Settings: ${JSON.stringify(appSettings, null, 2)}`);

  const AppDataSource = await initializeAppDataSource();

  const draftDripListRepository = new DraftDripListRepository(AppDataSource);
  const votingRoundRepository = new VotingRoundRepository(AppDataSource);
  const collaboratorRepository = new CollaboratorRepository(AppDataSource);
  const votingRoundService = new VotingRoundService(
    collaboratorRepository,
    votingRoundRepository,
  );

  const createDraftDripListEndpoint = new CreateDraftDripListEndpoint(
    new CreateDraftDripListUseCase(logger, draftDripListRepository),
  );
  const getDraftDripListByIdEndpoint = new GetDraftDripListByIdEndpoint(
    new GetDraftDripListByIdUseCase(draftDripListRepository),
  );
  const deleteDraftDripListEndpoint = new DeleteDraftDripListEndpoint(
    new DeleteDraftDripListUseCase(logger, draftDripListRepository),
  );
  const startVotingRoundEndpoint = new StartVotingRoundEndpoint(
    new StartVotingRoundUseCase(logger, draftDripListRepository),
  );
  const deleteCurrentVotingRoundEndpoint = new DeleteCurrentVotingRoundEndpoint(
    new DeleteCurrentVotingRoundUseCase(logger, draftDripListRepository),
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
      createDraftDripListEndpoint,
      getDraftDripListByIdEndpoint,
      deleteDraftDripListEndpoint,
      startVotingRoundEndpoint,
      deleteCurrentVotingRoundEndpoint,
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
