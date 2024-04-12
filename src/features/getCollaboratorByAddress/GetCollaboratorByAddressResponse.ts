import type { ReceiverDto } from '../../application/dtos';

export type GetCollaboratorByAddressResponse = {
  isCollaborator: boolean;
  hasVoted: boolean;
  latestVote: ReceiverDto[] | null;
};
