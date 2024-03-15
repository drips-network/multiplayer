import type { ReceiverDto } from '../../application/dtos/ReceiverDto';

export type GetVotingRoundResultResponse = {
  result: ReceiverDto[] | null;
};
