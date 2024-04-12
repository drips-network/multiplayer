import type { ReceiverDto } from '../../application/dtos/ReceiverDto';

export type GetCollaboratorByAddressResponse = {
  isCollaborator: boolean;
  hasVoted: boolean;
  latestVote: ReceiverDto[] | null;
};
