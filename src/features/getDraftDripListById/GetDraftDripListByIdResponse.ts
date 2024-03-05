import type { UUID } from 'crypto';

export type GetDraftDripListByIdResponse = {
  id: UUID;
  name: string;
  description: string;
  currentVotingRoundId: UUID | null;
  publisher: {
    address: string;
    addressDriverId: string;
  };
};
