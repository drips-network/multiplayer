import getContractNameFromAccountId from './getContractNameFromAccountId';

export type BigIntString = string & { __type: 'BigIntString' };

export function toBigIntString(string: string): BigIntString {
  const bigInt = BigInt(string);

  return bigInt.toString() as BigIntString;
}

export type AddressId = string & { __type: 'AddressId' };

export function isAddressId(idAsString: string): idAsString is AddressId {
  const isNaN = Number.isNaN(Number(idAsString));

  const isAccountIdOfAddressDriver =
    getContractNameFromAccountId(idAsString) === 'addressDriver';

  if (isNaN || !isAccountIdOfAddressDriver) {
    return false;
  }

  return true;
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
  if (isProjectId(id) || isDripListId(id) || isAddressId(id)) {
    return true;
  }

  return false;
}
