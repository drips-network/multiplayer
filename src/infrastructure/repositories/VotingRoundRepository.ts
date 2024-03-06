import type { UUID } from 'crypto';
import { In, type DataSource, type Repository } from 'typeorm';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import VotingRound from '../../domain/votingRoundAggregate/VotingRound';
import type { AccountId } from '../../domain/typeUtils';

export default class VotingRoundRepository implements IVotingRoundRepository {
  private readonly _repository: Repository<VotingRound>;

  public constructor(dataSource: DataSource) {
    this._repository = dataSource.getRepository(VotingRound);
  }

  public getById(votingRoundId: UUID): Promise<VotingRound | null> {
    return this._repository.findOne({
      where: {
        _id: votingRoundId,
      },
      relations: [
        '_collaborators',
        '_draftDripList',
        '_votes',
        '_votes._collaborator',
      ],
    });
  }

  public async collaboratorExists(
    collaboratorIds: AccountId[],
  ): Promise<boolean> {
    const count = await this._repository.count({
      where: {
        _id: In(collaboratorIds),
      },
    });

    return count > 0;
  }

  public async save(votingRound: VotingRound): Promise<void> {
    await this._repository.save(votingRound);
  }
}
