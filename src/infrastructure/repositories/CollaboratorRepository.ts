import { In, type DataSource, type Repository } from 'typeorm';
import type ICollaboratorRepository from '../../domain/collaboratorAggregate/ICollaboratorRepository';
import Collaborator from '../../domain/collaboratorAggregate/Collaborator';
import type { Address } from '../../domain/typeUtils';

export default class CollaboratorRepository implements ICollaboratorRepository {
  private readonly _repository: Repository<Collaborator>;

  public constructor(dataSource: DataSource) {
    this._repository = dataSource.getRepository(Collaborator);
  }

  public async getManyByAddresses(
    addresses: Address[],
  ): Promise<Collaborator[]> {
    return this._repository.find({
      where: {
        _address: In(addresses),
      },
    });
  }

  public async createMany(collaborators: Collaborator[]): Promise<void> {
    await this._repository.save(collaborators);
  }

  public getByAddress(address: Address): Promise<Collaborator | null> {
    return this._repository.findOne({
      where: {
        _address: address,
      },
    });
  }
}
