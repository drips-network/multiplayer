import type { Repository } from 'typeorm';
import type UseCase from '../../application/interfaces/IUseCase';
import type { DeleteVotingRoundResponse } from './DeleteVotingRoundResponse';
import type { DraftDripList } from '../../domain/draftDripListAggregate/DraftDripList';
import type { DeleteVotingRoundRequest } from './DeleteVotingRoundRequest';
import { NotFoundError } from '../../application/errors';

export default class DeleteVotingRoundUseCase
  implements UseCase<DeleteVotingRoundRequest, DeleteVotingRoundResponse>
{
  private readonly _repository: Repository<DraftDripList>;

  public constructor(repository: Repository<DraftDripList>) {
    this._repository = repository;
  }

  public async execute(
    request: DeleteVotingRoundRequest,
  ): Promise<DeleteVotingRoundResponse> {
    const { draftDripListId, startsAt, endsAt } = request;

    const draftDripList = await this._repository.findOne({
      where: { id: draftDripListId },
      relations: ['_votingRounds'],
    });

    if (!draftDripList) {
      throw new NotFoundError('DraftDripList not found.');
    }

    draftDripList.startVotingRound(startsAt, endsAt);

    await this._repository.save(draftDripList);

    return {
      votingRoundId: draftDripList.currentVotingRound!.id,
    };
  }
}
