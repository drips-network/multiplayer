import type { UUID } from 'crypto';

export type GetVotingRoundByIdResponse = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
  draftDripListId: UUID;
  status: 'started' | 'completed' | 'deleted';
  votes: {
    collaboratorAddress: string;
    latestVote:
      | {
          receiverId: string;
          percentage: number;
        }[]
      | null;
  }[];
};
