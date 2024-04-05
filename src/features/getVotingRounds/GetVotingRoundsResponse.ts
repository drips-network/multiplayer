import type { VotingRoundDto } from '../../application/dtos';

export type GetVotingRoundsResponse = {
  votingRounds: VotingRoundDto[] | null;
};
