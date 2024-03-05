import type { UUID } from 'crypto';

export type GetVotingRoundByIdResponse = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
  draftDripListId: UUID;
  status: 'started' | 'completed' | 'deleted';
  collaborators:
    | {
        address: string;
        addressDriverId: string;
        vote: {
          toBeImplemented: 'Vote';
        };
      }[]
    | null;
};
