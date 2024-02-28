import type { Repository } from 'typeorm';
import type UseCase from '../../application/interfaces/IUseCase';
import type { StartVotingRoundResponse } from './StartVotingRoundResponse';
import type { DraftDripList } from '../../domain/draftDripListAggregate/DraftDripList';
import type { StartVotingRoundRequest } from './StartVotingRoundRequest';
import { NotFoundError } from '../../application/errors';

export default class StartVotingRoundUseCase
  implements UseCase<StartVotingRoundRequest, StartVotingRoundResponse>
{
  private readonly _repository: Repository<DraftDripList>;

  public constructor(repository: Repository<DraftDripList>) {
    this._repository = repository;
  }

  public async execute(
    request: StartVotingRoundRequest,
  ): Promise<StartVotingRoundResponse> {
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
