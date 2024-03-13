export type StartVotingRoundRequest = {
  endsAt: Date;
  dripListId: string;
  name: string;
  description: string;
  publisherAddress: string;
  collaborators: string[]; // Addresses.
};
