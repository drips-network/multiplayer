export type StartVotingRoundRequest = {
  startsAt: Date;
  endsAt: Date;
  dripListId: string;
  name: string;
  description: string | undefined;
  publisherAddress: string;
  collaborators: string[]; // Addresses.
  signature: string;
  date: Date;
  privateVotes: boolean;
  nominationStartsAt: Date | undefined;
  nominationEndsAt: Date | undefined;
};
