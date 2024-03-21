import type { UUID } from 'crypto';

export type GetVotingRoundByIdResponse = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
  dripListId: string | undefined;
  name: string | undefined;
  description: string | undefined;
  publisherAddress: string;
  status: 'started' | 'completed' | 'deleted';
  privateVotes: boolean;
};
