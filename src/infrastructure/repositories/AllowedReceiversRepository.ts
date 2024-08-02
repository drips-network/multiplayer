import type { DataSource, Repository } from 'typeorm';
import type IAllowedReceiversRepository from '../../domain/allowedReceiver/IAllowedReceiversRepository';
import AllowedReceiver from '../../domain/allowedReceiver/AllowedReceiver';

export default class AllowedReceiversRepository
  implements IAllowedReceiversRepository
{
  private readonly _repository: Repository<AllowedReceiver>;

  public constructor(dataSource: DataSource) {
    this._repository = dataSource.getRepository(AllowedReceiver);
  }

  async createMany(allowedReceivers: AllowedReceiver[]): Promise<void> {
    await this._repository.save(allowedReceivers);
  }
}
