import type { ReceiverDto } from '../../application/dtos';

export type GetVotingRoundResultResponse = {
  result: ReceiverDto[] | null;
};
