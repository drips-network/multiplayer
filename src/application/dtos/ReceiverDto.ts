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

export type ReceiverDto =
  | AddressReceiverDto
  | ProjectReceiverDto
  | DripListReceiverDto;