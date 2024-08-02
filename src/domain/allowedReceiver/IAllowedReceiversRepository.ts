import type AllowedReceiver from './AllowedReceiver';

export default interface IAllowedReceiversRepository {
  createMany(allowedReceivers: AllowedReceiver[]): Promise<void>;
}
