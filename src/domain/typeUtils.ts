import getContractNameFromAccountId from './getContractNameFromAccountId';

export type BigIntString = string & { __type: 'BigIntString' };

export function toBigIntString(string: string): BigIntString {
  const bigInt = BigInt(string);

  return bigInt.toString() as BigIntString;
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
