import type { UUID } from 'crypto';
import type VotingRound from './VotingRound';
import type { Address, DripListId } from '../typeUtils';
import type Publisher from '../publisherAggregate/Publisher';

export default interface IVotingRoundRepository {
  getById(
    votingRoundId: UUID,
    withRelations?: boolean,
  ): Promise<VotingRound | null>;
  getByFilter(filter: {
    dripListId: DripListId | undefined;
    publisherAddress: Address | undefined;
  }): Promise<VotingRound[]>;
  getActiveVotingRoundsByPublisher(
    publisher: Publisher,
  ): Promise<VotingRound[]>;
  softRemove(draftDripList: VotingRound): Promise<void>;
  save(votingRound: VotingRound): Promise<void>;
}
