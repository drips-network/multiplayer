import { isAddress } from 'ethers';
import getContractNameFromAccountId from './getContractNameFromAccountId';

export type AddressDriverId = string & { __type: 'AddressDriverId' };

export function isAddressDriverId(
  idAsString: string,
): idAsString is AddressDriverId {
  const isNaN = Number.isNaN(Number(idAsString));

  const isAccountIdOfAddressDriver =
    getContractNameFromAccountId(idAsString) === 'addressDriver';

  if (isNaN || !isAccountIdOfAddressDriver) {
    return false;
  }

  return true;
}

export function assertIsAddressDriverId(
  idAsString: string,
): asserts idAsString is AddressDriverId {
  if (!isAddressDriverId(idAsString)) {
    throw new Error('Invalid addressDriverId.');
  }
}

export function toAddressDriverId(idAsString: string): AddressDriverId {
  assertIsAddressDriverId(idAsString);

  return idAsString as AddressDriverId;
}

export type DripListId = string & { __type: 'DripListId' };

export default function isDripListId(id: string): id is DripListId {
  const isNaN = Number.isNaN(Number(id));
  const isAccountIdOfNftDriver =
    getContractNameFromAccountId(id) === 'nftDriver';

  if (isNaN || !isAccountIdOfNftDriver) {
    return false;
  }

  return true;
}

export function toDripListId(id: bigint | string): DripListId {
  const idAsString = id.toString();

  if (isDripListId(idAsString)) {
    return idAsString as DripListId;
  }

  throw new Error(`Invalid drip list ID: ${id}.`);
}

export type Address = string & { __type: 'Address' };

export function assertIsAddress(str: string): asserts str is Address {
  if (!isAddress(str)) {
    throw new Error('Invalid address.');
  }
}

export type ProjectId = string & { __type: 'ProjectId' };

export function isProjectId(id: string): id is ProjectId {
  const isNaN = Number.isNaN(Number(id));
  const isAccountIdOfRepoDriver =
    getContractNameFromAccountId(id) === 'repoDriver';

  if (isNaN || !isAccountIdOfRepoDriver) {
    return false;
  }

  return true;
}

export type AccountId = AddressDriverId | DripListId | ProjectId;

export function isAccountId(id: string): id is AccountId {
  if (isProjectId(id) || isDripListId(id) || isAddressDriverId(id)) {
    return true;
  }

  return false;
}

export function toAccountId(id: bigint | string): AccountId {
  const accountIdAsString = id.toString();

  if (
    isProjectId(accountIdAsString) ||
    isDripListId(accountIdAsString) ||
    isAddressDriverId(accountIdAsString)
  ) {
    return accountIdAsString as AccountId;
  }

  throw new Error(`Invalid account ID: ${id}.`);
}

export function assertIsAccountId(id: string): asserts id is AccountId {
  if (!isAccountId(id)) {
    throw new Error('Invalid account ID.');
  }
}
