import type { Address } from '../typeUtils';
import type Collaborator from './Collaborator';

export default interface ICollaboratorRepository {
  getManyByAddresses(addresses: Address[]): Promise<Collaborator[]>;
  createMany(collaborators: Collaborator[]): Promise<void>;
  getByAddress(address: Address): Promise<Collaborator | null>;
}
