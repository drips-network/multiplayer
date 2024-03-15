export type StartVotingRoundRequest = {
  endsAt: Date;
  dripListId: string;
  name: string;
  description: string | undefined;
  publisherAddress: string;
  collaborators: string[]; // Addresses.
  signature: string;
  date: Date;
  isPrivate: boolean;
};
