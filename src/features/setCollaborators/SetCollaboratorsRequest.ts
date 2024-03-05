import type { UUID } from 'crypto';

export type SetCollaboratorsRequest = {
  votingRoundId: UUID;
  collaborators: {
    address: string;
    addressDriverId: string;
  }[];
};
