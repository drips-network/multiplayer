export type AddressDto = string;
export type AccountIdDto = string;

export type AddressReceiverDto = {
  address: string;
  weight: number;
  type: 'address';
};

export type ProjectReceiverDto = {
  url: string;
  weight: number;
  type: 'project';
};

export type DripListReceiverDto = {
  accountId: string;
  weight: number;
  type: 'dripList';
};

export type ReceiverDto =
  | AddressReceiverDto
  | ProjectReceiverDto
  | DripListReceiverDto;
