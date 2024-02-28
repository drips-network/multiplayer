import ApiServer from './ApiServer';
import 'reflect-metadata';
import logger from './infrastructure/logger';
import appSettings from './appSettings';
import { DraftDripList } from './domain/draftDripListAggregate/DraftDripList';
import { initializeAppDataSource } from './infrastructure/AppDataSource';
import CreateDraftDripListEndpoint from './features/createDraftDripList/CreateDraftDripListEndpoint';
import CreateDraftDripListUseCase from './features/createDraftDripList/CreateDraftDripListUseCase';
import DeleteDraftDripListEndpoint from './features/deleteDraftDripList/DeleteDraftDripListEndpoint';
import DeleteDraftDripListUseCase from './features/deleteDraftDripList/DeleteDraftDripListUseCase';
import GetDraftDripListByIdEndpoint from './features/getDraftDripListById/GetDraftDripListByIdEndpoint';
import GetDraftDripListByIdUseCase from './features/getDraftDripListById/GetDraftDripListByIdUseCase';
import Publisher from './domain/draftDripListAggregate/Publisher';
import StartVotingRoundEndpoint from './features/startVotingRound/StartVotingRoundEndpoint';
import StartVotingRoundUseCase from './features/startVotingRound/StartVotingRoundUseCase';

export async function main(): Promise<void> {
  logger.info('Starting the application...');
  logger.info(`App Settings: ${JSON.stringify(appSettings, null, 2)}`);

  const AppDataSource = await initializeAppDataSource();

  const publisherRepository = AppDataSource.getRepository(Publisher);
  const draftDripListRepository = AppDataSource.getRepository(DraftDripList);

  const createDraftDripListEndpoint = new CreateDraftDripListEndpoint(
    new CreateDraftDripListUseCase(
      draftDripListRepository,
      publisherRepository,
    ),
  );
  const getDraftDripListByIdEndpoint = new GetDraftDripListByIdEndpoint(
    new GetDraftDripListByIdUseCase(draftDripListRepository),
  );
  const deleteDraftDripListEndpoint = new DeleteDraftDripListEndpoint(
    new DeleteDraftDripListUseCase(draftDripListRepository),
  );
  const startVotingRoundEndpoint = new StartVotingRoundEndpoint(
    new StartVotingRoundUseCase(draftDripListRepository),
  );

  await ApiServer.run(
    createDraftDripListEndpoint,
    getDraftDripListByIdEndpoint,
    deleteDraftDripListEndpoint,
    startVotingRoundEndpoint,
  );
}

(async () => {
  await main();
})();

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
});
