import type { UUID } from 'crypto';
import type { ReceiverDto } from '../../application/dtos/ReceiverDto';

export type GetVotingRoundByIdResponse = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
  dripListId: string | undefined;
  name: string | undefined;
  description: string | undefined;
  publisherAddress: string;
  status: 'started' | 'completed' | 'deleted' | 'linked';
  privateVotes: boolean;
  linkedAt: Date | undefined;
  result: ReceiverDto[] | null; // `null` if the voting round is private or noon has voted yet.
};
