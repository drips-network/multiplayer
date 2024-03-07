import type { UUID } from 'crypto';
import type VotingRound from './VotingRound';
import type { Address, VotingRoundDripListId } from '../typeUtils';
import type Publisher from '../publisherAggregate/Publisher';

export default interface IVotingRoundRepository {
  getById(votingRoundId: UUID): Promise<VotingRound | null>;
  getByFilter(filter: {
    dripListId?: VotingRoundDripListId;
    publisherAddress?: Address;
  }): Promise<VotingRound[]>;
  softRemove(draftDripList: VotingRound): Promise<void>;
  existsBy(
    dripListId: VotingRoundDripListId,
    publisher: Publisher,
  ): Promise<boolean>;
  save(votingRound: VotingRound): Promise<void>;
}
