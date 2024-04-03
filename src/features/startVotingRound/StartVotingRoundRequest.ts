import type { AddressDto } from '../../application/dtos/commmon';

type Schedule =
  | {
      startsAt: Date;
      endsAt: Date;
      nominationStartsAt: Date;
      nominationEndsAt: Date;
    }
  | {
      startsAt: Date | undefined;
      endsAt: Date;
      nominationStartsAt: undefined;
      nominationEndsAt: undefined;
    };

export type StartVotingRoundRequest =
  | {
      dripListId: string;
      publisherAddress: string;
      collaborators: AddressDto[];
      signature: string;
      date: Date;
      privateVotes: boolean;
      schedule: Schedule;
    }
  | {
      name: string;
      description: string | undefined;
      publisherAddress: string;
      collaborators: AddressDto[];
      signature: string;
      date: Date;
      privateVotes: boolean;
      schedule: Schedule;
    };
