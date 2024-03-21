import type { Address } from './typeUtils';

export type DripList = {
  owner: {
    address: Address;
  };
  latestVotingRoundId: string | undefined;
};
