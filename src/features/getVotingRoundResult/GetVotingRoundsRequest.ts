import type { UUID } from 'crypto';

export type GetVotingRoundsRequest = {
  votingRoundId: UUID;
  signature: string | undefined;
  date: string | undefined;
};
