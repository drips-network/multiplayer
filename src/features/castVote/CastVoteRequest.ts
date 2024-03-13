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
  // votingRoundId: UUID // URL parameter.
  collaboratorAddress: string;
  receivers: ReceiverDto[];
  signature: string;
  date: Date;
};
