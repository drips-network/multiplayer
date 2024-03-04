import type { UUID } from 'crypto';
import type VotingRound from './VotingRound';

export default interface IVotingRoundRepository {
  getById(votingRoundId: UUID): Promise<VotingRound | null>;

  save(draftDripList: VotingRound): Promise<void>;
}
