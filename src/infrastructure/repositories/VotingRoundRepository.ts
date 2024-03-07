import type { UUID } from 'crypto';
import type { DataSource, Repository } from 'typeorm';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import VotingRound from '../../domain/votingRoundAggregate/VotingRound';
import type { Address, VotingRoundDripListId } from '../../domain/typeUtils';
import type Publisher from '../../domain/publisherAggregate/Publisher';

export default class VotingRoundRepository implements IVotingRoundRepository {
  private readonly _repository: Repository<VotingRound>;

  public constructor(dataSource: DataSource) {
    this._repository = dataSource.getRepository(VotingRound);
  }

  public async existsBy(
    dripListId: VotingRoundDripListId,
    publisher: Publisher,
  ): Promise<boolean> {
    const listVotingRounds = await this._repository.find({
      where: {
        _dripListId: dripListId,
        _publisher: publisher,
      },
      relations: ['_publisher'],
    });

    return listVotingRounds.some(
      (votingRound) => votingRound.status === 'started',
    );
  }

  public async getById(votingRoundId: UUID): Promise<VotingRound | null> {
    return this._repository.findOne({
      where: {
        _id: votingRoundId,
      },
      relations: [
        '_collaborators',
        '_votes',
        '_votes._collaborator',
        '_publisher',
      ],
    });
  }

  public async getByFilter(filter: {
    dripListId?: VotingRoundDripListId;
    publisherAddress?: Address;
  }): Promise<VotingRound[]> {
    return this._repository.find({
      where: {
        _dripListId: filter.dripListId,
        _publisher: {
          _address: filter.publisherAddress,
        },
      },
    });
  }

  async softRemove(votingRound: VotingRound): Promise<void> {
    await this._repository.softRemove(votingRound);
  }

  public async save(votingRound: VotingRound): Promise<void> {
    await this._repository.save(votingRound);
  }
}
