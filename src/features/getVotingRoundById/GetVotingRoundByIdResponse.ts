import type { UUID } from 'crypto';

type VoteAllocationDto = {
  receiverId: string;
  weight: number;
};

export type GetVotingRoundByIdResponse = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
  dripListId: string | undefined;
  name: string | undefined;
  description: string | undefined;
  status: 'started' | 'completed' | 'deleted';
  votes: {
    collaboratorAddress: string;
    latestVote: VoteAllocationDto[] | undefined;
  }[];
  result: VoteAllocationDto[] | null;
};
