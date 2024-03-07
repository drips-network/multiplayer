import type { Address } from '../typeUtils';
import type Publisher from './Publisher';

export default interface IPublisherRepository {
  getByAddress(address: Address): Promise<Publisher | null>;
  save(publisher: Publisher): Promise<void>;
}
