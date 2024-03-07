import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { PublishRequest } from './PublishRequest';
import {} from '../../domain/typeUtils';

export default class PublishUseCase implements UseCase<PublishRequest> {
  private readonly _logger: Logger;

  public constructor(logger: Logger) {
    this._logger = logger;
  }

  public async execute(request: PublishRequest): Promise<void> {
    // TODO: Verify the request is coming from the publisher by checking the signature token.

    const { votingRoundId, dripListId, publisherAddress } = request;

    this._logger.info(
      `Publishing voting round with ID '${votingRoundId}' for drip list with ID '${dripListId}'...`,
    );

    this._logger.info(
      `Voting round with ID '${votingRoundId}' for drip list with ID '${dripListId}' published successfully.`,
    );
  }
}
