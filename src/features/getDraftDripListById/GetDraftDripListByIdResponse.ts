import type { UUID } from 'crypto';

export type GetDraftDripListByIdResponse = {
  id: UUID;
  name: string;
  description: string;
  currentVotingRound: {
    id: UUID;
    startsAt: Date;
    endsAt: Date;
  } | null;
  publisher: {
    id: UUID;
    address: string;
    addressDriverId: string;
  };
};
