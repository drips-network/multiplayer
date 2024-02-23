import ApiServer from './ApiServer';
import 'reflect-metadata';
import StartVotingRoundUseCase from './features/votingRound/startVotingRound/StartVotingRound.UseCase';
import StartVotingRoundEndpoint from './features/votingRound/startVotingRound/StartVotingRound.Endpoint';
import { VotingRound } from './domain/VotingRound';
import logger from './infrastructure/logger';
import appSettings from './appSettings';
import { DraftDripList } from './domain/DraftDripList';
import { initializeAppDataSource } from './infrastructure/AppDataSource';
import CreateDraftDripListEndpoint from './features/draftDripList/create/CreateDraftDripList.Endpoint';
import CreateDraftDripListUseCase from './features/draftDripList/create/CreateDraftDripList.UseCase';
import GetDraftDripListByIdEndpoint from './features/draftDripList/getById/GetDraftDripListById.Endpoint';
import GetDraftDripListByIdUseCase from './features/draftDripList/getById/GetDraftDripListById.UseCase';

export async function main(): Promise<void> {
  logger.info('Starting the application...');
  logger.info(`App Settings: ${JSON.stringify(appSettings, null, 2)}`);

  const AppDataSource = await initializeAppDataSource();

  const getDraftDripListByIdEndpoint = new GetDraftDripListByIdEndpoint(
    new GetDraftDripListByIdUseCase(AppDataSource.getRepository(DraftDripList)),
  );
  const createDraftDripListEndpoint = new CreateDraftDripListEndpoint(
    new CreateDraftDripListUseCase(AppDataSource.getRepository(DraftDripList)),
  );
  const startVotingRoundEndpoint = new StartVotingRoundEndpoint(
    new StartVotingRoundUseCase(AppDataSource.getRepository(VotingRound)),
  );

  await ApiServer.run(
    startVotingRoundEndpoint,
    createDraftDripListEndpoint,
    getDraftDripListByIdEndpoint,
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
