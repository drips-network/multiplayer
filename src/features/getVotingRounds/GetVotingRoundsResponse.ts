import type { UUID } from 'crypto';

type ReceiverDto = {
  accountId: string;
  weight: number;
};

export type GetVotingRoundsResponse = {
  votingRounds:
    | {
        id: UUID;
        startsAt: Date;
        endsAt: Date;
        dripListId: string | undefined;
        name: string | undefined;
        description: string | undefined;
        status: 'started' | 'completed' | 'deleted';
        votes: {
          collaboratorAddress: string;
          latestVote: ReceiverDto[] | undefined;
        }[];
        result: ReceiverDto[] | null;
      }[]
    | undefined;
};
