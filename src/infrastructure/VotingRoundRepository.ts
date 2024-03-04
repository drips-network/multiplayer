import type { UUID } from 'crypto';
import type { Repository } from 'typeorm';
import type IVotingRoundRepository from '../domain/votingRoundAggregate/IVotingRoundRepository';
import type VotingRound from '../domain/votingRoundAggregate/VotingRound';

export default class VotingRoundRepository implements IVotingRoundRepository {
  private readonly _repository: Repository<VotingRound>;

  public constructor(repository: Repository<VotingRound>) {
    this._repository = repository;
  }

  public getById(votingRoundId: UUID): Promise<VotingRound | null> {
    return this._repository.findOne({
      where: {
        _id: votingRoundId,
      },
    });
  }

  public async save(draftDripList: VotingRound): Promise<void> {
    await this._repository.save(draftDripList);
  }
}
