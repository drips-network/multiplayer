import type { UUID } from 'crypto';

type CollaboratorDto = {
  id: UUID;
  address: string;
};

export type GetDraftDripListByIdResponse = {
  id: UUID;
  name: string;
  description: string;
  collaborators: CollaboratorDto[];
};
