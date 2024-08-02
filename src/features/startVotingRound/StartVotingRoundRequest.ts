import type {
  AddressDto,
  AllowedReceiverDto,
  ScheduleDto,
  ScheduleWithoutNomination,
} from '../../application/dtos';

type CommonStartVotingRoundProps = {
  publisherAddress: string;
  collaborators: AddressDto[];
  signature: string;
  date: Date;
  areVotesPrivate: boolean;
};

type WithDripListId = CommonStartVotingRoundProps & {
  dripListId: string;
};

type WithNameAndDescription = CommonStartVotingRoundProps & {
  name: string;
  description?: string;
};

export type StartVotingRoundRequest =
  | (WithDripListId & { schedule: ScheduleDto })
  | (WithDripListId & {
      schedule: ScheduleWithoutNomination;
      allowedReceivers: AllowedReceiverDto[];
    })
  | (WithNameAndDescription & { schedule: ScheduleDto })
  | (WithNameAndDescription & {
      schedule: ScheduleWithoutNomination;
      allowedReceivers: AllowedReceiverDto[];
    });
