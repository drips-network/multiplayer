import type { ReceiverDto } from '../../application/dtos/ReceiverDto';
import type { AddressDto } from '../../application/dtos/commmon';

export type CastVoteRequest = {
  collaboratorAddress: AddressDto;
  receivers: ReceiverDto[];
  signature: string;
  date: Date;
};
