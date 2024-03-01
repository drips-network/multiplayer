import type { Repository } from 'typeorm';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { DeleteDraftDripListRequest } from './DeleteDraftDripListRequest';
import type DraftDripList from '../../domain/draftDripListAggregate/DraftDripList';
import { NotFoundError } from '../../application/errors';

export default class DeleteDraftDripListUseCase
  implements UseCase<DeleteDraftDripListRequest>
{
  private readonly _logger: Logger;
  private readonly _repository: Repository<DraftDripList>;

  public constructor(logger: Logger, repository: Repository<DraftDripList>) {
    this._logger = logger;
    this._repository = repository;
  }

  public async execute(request: DeleteDraftDripListRequest): Promise<void> {
    // TODO: Verify the request is coming from the publisher by checking the signature token.

    this._logger.info(`Deleting the draft drip list with ID '${request.id}'.`);

    const draftDripList = await this._repository.findOne({
      where: { _id: request.id },
      relations: ['_votingRounds'],
    });

    if (!draftDripList) {
      throw new NotFoundError(`DraftDripList with id ${request.id} not found.`);
    }

    await this._repository.softRemove(draftDripList);

    this._logger.info(
      `Deleted successfully the draft drip list with ID '${request.id}'.`,
    );
  }
}
