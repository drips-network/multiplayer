import type { UUID } from 'crypto';

export type StartVotingRoundRequest = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
};
