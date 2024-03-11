import type { UUID } from 'crypto';

type AddressReceiverDto = {
  address: string;
  accountId: string;
  weight: number;
  type: 'address';
};

type ProjectReceiverDto = {
  url: string;
  accountId: string;
  weight: number;
  type: 'project';
};

type DripListReceiverDto = {
  accountId: string;
  weight: number;
  type: 'dripList';
};

type ReceiverDto =
  | AddressReceiverDto
  | ProjectReceiverDto
  | DripListReceiverDto;

export type CastVoteRequest = {
  votingRoundId: UUID;
  collaboratorAddress: string;
  receivers: ReceiverDto[];
};
