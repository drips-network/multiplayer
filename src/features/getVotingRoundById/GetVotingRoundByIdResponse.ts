import type { UUID } from 'crypto';

type ReceiverDto = {
  accountId: string;
  weight: number;
};

export type GetVotingRoundByIdResponse = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
  dripListId: string | undefined;
  name: string | undefined;
  description: string | undefined;
  publisherAddress: string;
  status: 'started' | 'completed' | 'deleted';
  votes: {
    collaboratorAddress: string;
    latestVote: ReceiverDto[] | undefined;
  }[];
  result: ReceiverDto[] | null;
};
