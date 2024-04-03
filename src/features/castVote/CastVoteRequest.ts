import type { AddressDto, ReceiverDto } from '../../application/dtos';

export type CastVoteRequest = {
  collaboratorAddress: AddressDto;
  receivers: ReceiverDto[];
  signature: string;
  date: Date;
};
