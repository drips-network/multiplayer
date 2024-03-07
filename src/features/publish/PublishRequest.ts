import type { UUID } from 'crypto';

export type PublishRequest = {
  votingRoundId: UUID;
  dripListId: string;
  publisherAddress: string;
};
