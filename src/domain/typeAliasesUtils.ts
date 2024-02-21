import { randomUUID, type UUID } from 'crypto';

export type BigIntString = string & { __type: 'BigIntString' };

export function toBigIntString(string: string): BigIntString {
  const bigInt = BigInt(string);

  return bigInt.toString() as BigIntString;
}

export type VotingRoundId = UUID & { __type: 'VotingRoundId' };

export function createVotingRoundId(): VotingRoundId {
  return randomUUID() as VotingRoundId;
}
