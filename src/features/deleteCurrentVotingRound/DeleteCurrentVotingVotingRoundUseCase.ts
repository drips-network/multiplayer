import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type { DeleteCurrentVotingRoundRequest } from './DeleteCurrentVotingVotingRoundRequest';
import type IDraftDripListRepository from '../../domain/draftDripListAggregate/IDraftDripListRepository';

export default class DeleteCurrentVotingRoundUseCase
  implements UseCase<DeleteCurrentVotingRoundRequest>
{
  private readonly _logger: Logger;
  private readonly _repository: IDraftDripListRepository;

  public constructor(logger: Logger, repository: IDraftDripListRepository) {
    this._logger = logger;
    this._repository = repository;
  }

  public async execute(
    request: DeleteCurrentVotingRoundRequest,
  ): Promise<void> {
    // TODO: Verify the request is coming from the publisher by checking the signature token.

    const { id } = request;

    this._logger.info(
      `Deleting the current voting round for the draft drip list with ID '${id}'.`,
    );

    const draftDripList = await this._repository.getById(id);

    if (!draftDripList) {
      throw new NotFoundError('DraftDripList not found.');
    }

    draftDripList.deleteCurrentVotingRound();

    await this._repository.save(draftDripList);

    this._logger.info(
      `Deleted successfully the current voting round for the draft drip list with ID '${id}'.`,
    );
  }
}
