export type StartVotingRoundRequest = {
  startsAt: Date;
  endsAt: Date;
  dripListId: string;
  name: string;
  description: string;
  publisherAddress: string;
  publisherAddressDriverId: string;
  collaborators: {
    address: string;
    addressDriverId: string;
  }[];
};
