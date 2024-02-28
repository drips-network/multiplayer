import type { UUID } from 'crypto';

export type DeleteVotingRoundRequest = {
  startsAt: Date;
  endsAt: Date;
  draftDripListId: UUID;
};
