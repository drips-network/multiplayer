export type StartVotingRoundRequest = {
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
