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

export async function main(): Promise<void> {
  logger.info('Starting the application...');
  logger.info(`App Settings: ${JSON.stringify(appSettings, null, 2)}`);

  const AppDataSource = await initializeAppDataSource();

  const createDraftDripListEndpoint = new CreateDraftDripListEndpoint(
    new CreateDraftDripListUseCase(AppDataSource.getRepository(DraftDripList)),
  );
  const getDraftDripListByIdEndpoint = new GetDraftDripListByIdEndpoint(
    new GetDraftDripListByIdUseCase(AppDataSource.getRepository(DraftDripList)),
  );
  const deleteDraftDripListEndpoint = new DeleteDraftDripListEndpoint(
    new DeleteDraftDripListUseCase(AppDataSource.getRepository(DraftDripList)),
  );

  await ApiServer.run(
    createDraftDripListEndpoint,
    getDraftDripListByIdEndpoint,
    deleteDraftDripListEndpoint,
  );
}

(async () => {
  await main();
})();

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`);

  // Railways will restart the process if it exits with a non-zero exit code.
  process.exit(1);
});
