import type { UUID } from 'crypto';
import type { NominationStatus } from '../domain/votingRoundAggregate/Nomination';
import type {
  AddressNominationDto,
  DripListNominationDto,
  ImpactMetricDto,
  ProjectNominationDto,
} from '../features/nominate/NominateRequest';

export type AddressDto = string;
export type AccountIdDto = string;

export type AddressReceiverDto = {
  address: string;
  weight: number;
  type: 'address';
};

export type ProjectReceiverDto = {
  url: string;
  weight: number;
  type: 'project';
};

export type DripListReceiverDto = {
  accountId: string;
  weight: number;
  type: 'dripList';
};

export type ReceiverDto =
  | AddressReceiverDto
  | ProjectReceiverDto
  | DripListReceiverDto;

export type ScheduleDto =
  | {
      voting: {
        startsAt: Date;
        endsAt: Date;
      };
      nomination: {
        startsAt: Date;
        endsAt: Date;
      };
    }
  | {
      voting: {
        startsAt: Date | undefined;
        endsAt: Date;
      };
      nomination: undefined;
    };

type InfoDto = {
  accountId: AccountIdDto;
  status: NominationStatus;
  nominatedBy: AddressDto;
  nominatedAt: Date;
  statusChangedAt: Date;
  description: string;
  impactMetrics: ImpactMetricDto[];
};

export type AddressNominationInfoDto = AddressNominationDto & InfoDto;
export type ProjectNominationInfoDto = ProjectNominationDto & InfoDto;
export type DripListNominationInfoDto = DripListNominationDto & InfoDto;

export type NominationInfoDto =
  | AddressNominationInfoDto
  | ProjectNominationInfoDto
  | DripListNominationInfoDto;

export type VotingRoundStatusDto =
  | 'Started'
  | 'Completed'
  | 'Linked'
  | 'Deleted'
  | 'PendingLinkCompletion';

type NominationPeriodDto =
  | {
      isOpen: boolean;
      nominations: NominationInfoDto[];
    }
  | undefined; // `undefined` if the Voting Round does not support a nomination period.

type VotesDto =
  | {
      collaboratorAddress: string;
      votedAt: Date | null;
      latestVote: ReceiverDto[] | null;
    }[]
  | null; // `null` if the voting round is private or no one has voted yet.

type ResultDto = ReceiverDto[] | null; // `null` if the voting round is private or no one has voted yet.

export type VotingRoundDto = {
  id: UUID;
  dripListId: string | null;
  schedule: ScheduleDto;
  publisherAddress: AddressDto;
  status: VotingRoundStatusDto;
  areVotesPrivate: boolean;
  linkedAt: Date | null;
  result: ResultDto;
  votes: VotesDto;
  hasVotingPeriodStarted: boolean;
  nominationPeriod: NominationPeriodDto;
  name: string | null;
  description: string | null;
};
