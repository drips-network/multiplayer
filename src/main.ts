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
import Publisher from './domain/draftDripListAggregate/Publisher';
import DraftDripList from './domain/draftDripListAggregate/DraftDripList';
import DeleteCurrentVotingRoundEndpoint from './features/deleteCurrentVotingRound/DeleteCurrentVotingVotingRoundEndpoint';
import DeleteCurrentVotingRoundUseCase from './features/deleteCurrentVotingRound/DeleteCurrentVotingVotingRoundUseCase';

export async function main(): Promise<void> {
  logger.info('Starting the application...');
  logger.info(`App Settings: ${JSON.stringify(appSettings, null, 2)}`);

  const AppDataSource = await initializeAppDataSource();

  const publisherRepository = AppDataSource.getRepository(Publisher);
  const draftDripListRepository = AppDataSource.getRepository(DraftDripList);

  const createDraftDripListEndpoint = new CreateDraftDripListEndpoint(
    new CreateDraftDripListUseCase(
      logger,
      publisherRepository,
      draftDripListRepository,
    ),
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

  await ApiServer.run(
    [
      createDraftDripListEndpoint,
      getDraftDripListByIdEndpoint,
      deleteDraftDripListEndpoint,
      startVotingRoundEndpoint,
      deleteCurrentVotingRoundEndpoint,
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
