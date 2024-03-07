import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type { SoftDeleteVotingRoundRequest } from './SoftDeleteVotingVotingRoundRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';

export default class SoftDeleteVotingRoundUseCase
  implements UseCase<SoftDeleteVotingRoundRequest>
{
  private readonly _logger: Logger;
  private readonly _repository: IVotingRoundRepository;

  public constructor(logger: Logger, repository: IVotingRoundRepository) {
    this._logger = logger;
    this._repository = repository;
  }

  public async execute(request: SoftDeleteVotingRoundRequest): Promise<void> {
    // TODO: Verify the request is coming from the publisher by checking the signature token.

    const { id } = request;

    this._logger.info(`Deleting the current voting round with ID '${id}'...`);

    const votingRound = await this._repository.getById(id);

    if (!votingRound) {
      throw new NotFoundError('Voting round not found.');
    }

    await this._repository.softRemove(votingRound);

    this._logger.info(
      `Deleted successfully the current voting round with ID '${id}'.`,
    );
  }
}
