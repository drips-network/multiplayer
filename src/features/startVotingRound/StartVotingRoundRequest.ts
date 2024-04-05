import type { AddressDto, ScheduleDto } from '../../application/dtos';

export type StartVotingRoundRequest =
  | {
      dripListId: string;
      publisherAddress: string;
      collaborators: AddressDto[];
      signature: string;
      date: Date;
      areVotesPrivate: boolean;
      schedule: ScheduleDto;
    }
  | {
      name: string;
      description: string | undefined;
      publisherAddress: string;
      collaborators: AddressDto[];
      signature: string;
      date: Date;
      areVotesPrivate: boolean;
      schedule: ScheduleDto;
    };
