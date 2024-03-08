import type { UUID } from 'crypto';

export type LinkRequest = {
  publisherAddress: string;
  votingRoundId: UUID;
};
