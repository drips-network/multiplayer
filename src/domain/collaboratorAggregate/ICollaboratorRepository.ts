import type { Address, AddressDriverId } from '../typeUtils';
import type Collaborator from './Collaborator';

export default interface ICollaboratorRepository {
  getMany(
    uniqueIdentifiers: {
      addressDriverId: AddressDriverId;
      address: Address;
    }[],
  ): Promise<Collaborator[]>;
  createMany(collaborators: Collaborator[]): Promise<void>;
  getByAddress(address: Address): Promise<Collaborator | null>;
}
