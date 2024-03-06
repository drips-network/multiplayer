import type { UUID } from 'crypto';

export type CastVoteRequest = {
  votingRoundId: UUID;
  collaboratorAddress: string;
  voteAllocations: { receiverId: UUID; percentage: number }[];
};
