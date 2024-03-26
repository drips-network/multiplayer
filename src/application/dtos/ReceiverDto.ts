import type { Receiver } from '../../domain/votingRoundAggregate/Vote';

type AddressReceiverDto = {
  address: string;
  weight: number;
  type: 'address';
};

type ProjectReceiverDto = {
  url: string;
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

export function toDto(receiver: Receiver): ReceiverDto {
  if ('address' in receiver) {
    return {
      address: receiver.address,
      weight: receiver.weight,
      type: receiver.type,
    };
  }
  if ('url' in receiver) {
    return {
      url: receiver.url,
      weight: receiver.weight,
      type: receiver.type,
    };
  }

  return {
    accountId: receiver.accountId,
    weight: receiver.weight,
    type: receiver.type,
  };
}
