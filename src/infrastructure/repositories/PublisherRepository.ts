import type { DataSource, Repository } from 'typeorm';
import type IPublisherRepository from '../../domain/publisherAggregate/IPublisherRepository';
import Publisher from '../../domain/publisherAggregate/Publisher';
import type { Address } from '../../domain/typeUtils';

export default class PublisherRepository implements IPublisherRepository {
  private readonly _repository: Repository<Publisher>;

  public constructor(dataSource: DataSource) {
    this._repository = dataSource.getRepository(Publisher);
  }

  public async getByAddress(address: Address): Promise<Publisher | null> {
    return this._repository.findOne({
      where: {
        _address: address,
      },
    });
  }

  public async save(publisher: Publisher): Promise<void> {
    await this._repository.save(publisher);
  }
}
