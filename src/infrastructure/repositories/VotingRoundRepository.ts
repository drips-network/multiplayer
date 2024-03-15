import type { UUID } from 'crypto';
import type { DataSource, Repository } from 'typeorm';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import VotingRound, {
  VotingRoundStatus,
} from '../../domain/votingRoundAggregate/VotingRound';
import type { Address, DripListId } from '../../domain/typeUtils';
import type Publisher from '../../domain/publisherAggregate/Publisher';
import shouldNeverHappen from '../../application/shouldNeverHappen';

export default class VotingRoundRepository implements IVotingRoundRepository {
  private readonly _repository: Repository<VotingRound>;

  public constructor(dataSource: DataSource) {
    this._repository = dataSource.getRepository(VotingRound);
  }

  public async getById(votingRoundId: UUID): Promise<VotingRound | null> {
    return this._repository.findOne({
      where: {
        _id: votingRoundId ?? shouldNeverHappen(),
      },
      relations: [
        '_collaborators',
        '_votes',
        '_votes._collaborator',
        '_publisher',
        '_link',
      ],
    });
  }

  public async getByFilter(filter: {
    dripListId: DripListId | undefined;
    publisherAddress: Address | undefined;
  }): Promise<VotingRound[]> {
    return this._repository.find({
      where: {
        _dripListId: filter.dripListId || undefined,
        _publisher: {
          _address: filter.publisherAddress || undefined,
        },
      },
      relations: [
        '_collaborators',
        '_votes',
        '_votes._collaborator',
        '_publisher',
        '_link',
      ],
    });
  }

  public getActiveVotingRoundsByPublisher(
    publisher: Publisher,
  ): Promise<VotingRound[]> {
    return (
      this._repository
        .find({
          where: {
            _publisher: publisher,
          },
        })
        .then((votingRounds) =>
          votingRounds.filter(
            (votingRound) => votingRound.status === VotingRoundStatus.Started,
          ),
        ) || []
    );
  }

  async softRemove(votingRound: VotingRound): Promise<void> {
    await this._repository.softRemove(votingRound);
  }

  public async save(votingRound: VotingRound): Promise<void> {
    await this._repository.save(votingRound);
  }
}
