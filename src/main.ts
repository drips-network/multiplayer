import ApiServer from './api/ApiServer';
import 'reflect-metadata';
import StartVotingRoundUseCase from './features/startVotingRound/StartVotingRound.UseCase';
import StartVotingRoundEndpoint from './features/startVotingRound/StartVotingRound.Endpoint';
import AppDataSource from './infrastructure/AppDataSource';
import { VotingRound } from './domain/VotingRound';
import logger from './infrastructure/logger';
import appSettings from './appSettings';

export async function main(): Promise<void> {
  logger.info('Starting the application...');
  logger.info(`App Settings: ${JSON.stringify(appSettings, null, 2)}`);

  const startVotingRoundEndpoint = new StartVotingRoundEndpoint(
    new StartVotingRoundUseCase(AppDataSource.getRepository(VotingRound)),
  );

  await ApiServer.run(startVotingRoundEndpoint);
}

(async () => {
  await main();
})();

process.on('uncaughtException', (error: Error) => {
  logger.error(`Uncaught Exception: ${error.message}`);

  // Railways will restart the process if it exits with a non-zero exit code.
  process.exit(1);
});
