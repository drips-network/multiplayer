import type { UUID } from 'crypto';

export type SetCollaboratorsRequest = {
  publisherAddress: UUID;
  votingRoundId: UUID;
  collaborators: {
    address: string;
    addressDriverId: string;
  }[];
};
