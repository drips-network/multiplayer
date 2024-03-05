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

export type Address = string & { __type: 'Address' };

export function isEthAddress(str: string): str is Address {
  const regex = /^(0x)?[0-9a-fA-F]{40}$/;
  return regex.test(str);
}

export function assertIsEthAddress(str: string): asserts str is Address {
  if (!isEthAddress(str)) {
    throw new Error('Invalid address.');
  }
}

export function toAddress(str: string): Address {
  assertIsEthAddress(str);

  return str as Address;
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

export type AccountId = string & { __type: 'AccountId' };

export function isAccountId(id: string): id is AccountId {
  if (isProjectId(id) || isDripListId(id) || isAddressDriverId(id)) {
    return true;
  }

  return false;
}
