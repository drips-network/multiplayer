export type StartVotingRoundRequest = {
  dripListId: string;
  startsAt: Date;
  endsAt: Date;
  name: string;
  description: string;
  publisherAddress: string;
  publisherAddressDriverId: string;
};
