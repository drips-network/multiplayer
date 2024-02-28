import type { UUID } from 'crypto';

export type StartVotingRoundRequest = {
  startsAt: Date;
  endsAt: Date;
  draftDripListId: UUID;
};
