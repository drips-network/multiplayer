import type { DataSource, Repository } from 'typeorm';
import type { UUID } from 'crypto';
import DraftDripList from '../../domain/draftDripListAggregate/DraftDripList';
import type IDraftDripListRepository from '../../domain/draftDripListAggregate/IDraftDripListRepository';

export default class DraftDripListRepository
  implements IDraftDripListRepository
{
  private readonly _repository: Repository<DraftDripList>;

  public constructor(dataSource: DataSource) {
    this._repository = dataSource.getRepository(DraftDripList);
  }

  public getById(draftDripListId: UUID): Promise<DraftDripList | null> {
    return this._repository.findOne({
      where: {
        _id: draftDripListId,
      },
      relations: ['_votingRounds._collaborators'],
    });
  }

  async softRemove(draftDripList: DraftDripList): Promise<void> {
    await this._repository.softRemove(draftDripList);
  }

  async save(draftDripList: DraftDripList): Promise<void> {
    await this._repository.save(draftDripList);
  }
}
