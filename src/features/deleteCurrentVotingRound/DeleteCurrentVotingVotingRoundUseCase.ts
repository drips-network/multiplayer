import type { Repository } from 'typeorm';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type DraftDripList from '../../domain/draftDripListAggregate/DraftDripList';
import { NotFoundError } from '../../application/errors';
import type { DeleteCurrentVotingRoundRequest } from './DeleteCurrentVotingVotingRoundRequest';

export default class DeleteCurrentVotingRoundUseCase
  implements UseCase<DeleteCurrentVotingRoundRequest>
{
  private readonly _logger: Logger;
  private readonly _repository: Repository<DraftDripList>;

  public constructor(logger: Logger, repository: Repository<DraftDripList>) {
    this._logger = logger;
    this._repository = repository;
  }

  public async execute(
    request: DeleteCurrentVotingRoundRequest,
  ): Promise<void> {
    const { id } = request;

    this._logger.info(
      `Deleting the current voting round for the draft drip list with ID '${id}'.`,
    );

    const draftDripList = await this._repository.findOne({
      where: { id },
      relations: ['_votingRounds'],
    });

    if (!draftDripList) {
      throw new NotFoundError('DraftDripList not found.');
    }

    draftDripList.deleteCurrentVotingRound();

    this._logger.info(
      `Deleted successfully the current voting round for the draft drip list with ID '${id}'.`,
    );

    await this._repository.save(draftDripList);
  }
}
