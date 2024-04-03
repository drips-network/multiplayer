import type { ReceiverDto } from '../../application/dtos';

export type GetVotingRoundVotesResponse = {
  votes: {
    collaboratorAddress: string;
    latestVote: ReceiverDto[] | null;
  }[];
};
