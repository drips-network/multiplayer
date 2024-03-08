import type { UUID } from 'crypto';

export type CastVoteRequest = {
  votingRoundId: UUID;
  collaboratorAddress: string;
  receivers: { accountId: string; weight: number }[];
};
