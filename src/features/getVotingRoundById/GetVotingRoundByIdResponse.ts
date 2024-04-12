import type { UUID } from 'crypto';
import type { ReceiverDto } from '../../application/dtos/ReceiverDto';

export type GetVotingRoundByIdResponse = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
  dripListId: string | null;
  name: string | null;
  description: string | null;
  publisherAddress: string;
  status: 'started' | 'completed' | 'deleted' | 'linked';
  privateVotes: boolean;
  linkedAt: Date | null;
  result: ReceiverDto[] | null; // `null` if the voting round is private or noon has voted yet.
  votes:
    | {
        collaboratorAddress: string;
        votedAt: Date | null;
        latestVote: ReceiverDto[] | null;
      }[]
    | null; // `null` if the voting round is private or noon has voted yet.
};
