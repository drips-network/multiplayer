import type { ReceiverDto } from '../../application/dtos/ReceiverDto';

export type GetVotingRoundVotesResponse = {
  votes: {
    collaboratorAddress: string;
    latestVote: ReceiverDto[] | undefined;
  }[];
};
