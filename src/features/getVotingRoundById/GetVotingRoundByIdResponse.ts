import type { UUID } from 'crypto';

type VoteAllocationDto = {
  receiverId: string;
  percentage: number;
};

export type GetVotingRoundByIdResponse = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
  dripListId: string;
  status: 'started' | 'completed' | 'deleted';
  votes: {
    collaboratorAddress: string;
    latestVote: VoteAllocationDto[] | null;
  }[];
  result: VoteAllocationDto[] | null;
};
