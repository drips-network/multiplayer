import type { Repository } from 'typeorm';
import type { UUID } from 'crypto';
import type UseCase from '../../common/application/interfaces/IUseCase';
import type NewVotingRoundRequest from './NewVotingRoundRequest';
import { VotingRound } from '../../domain/VotingRound';
import { toBigIntString } from '../../domain/typeAliasesUtils';

export default class StartVotingRoundUseCase
  implements UseCase<NewVotingRoundRequest, UUID>
{
  private readonly _repository: Repository<VotingRound>;

  public constructor(repository: Repository<VotingRound>) {
    this._repository = repository;
  }

  public async execute({
    startsAt,
    endsAt,
    draftDripListId,
  }: NewVotingRoundRequest): Promise<UUID> {
    const votingRound = new VotingRound(
      startsAt,
      endsAt,
      toBigIntString(draftDripListId),
    );

    await this._repository.save(votingRound);

    return votingRound.id;
  }
}
