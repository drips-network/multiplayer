import type { ReceiverDto } from '../../application/dtos/ReceiverDto';

export type CastVoteRequest = {
  // votingRoundId: UUID // URL parameter.
  collaboratorAddress: string;
  receivers: ReceiverDto[];
  signature: string;
  date: Date;
};
