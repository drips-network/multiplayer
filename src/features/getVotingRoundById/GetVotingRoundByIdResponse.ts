import type { UUID } from 'crypto';
import type {
  AddressNominationDto,
  DripListNominationDto,
  ProjectNominationDto,
} from '../nominate/NominateRequest';
import type {
  AccountIdDto,
  AddressDto,
  ReceiverDto,
} from '../../application/dtos';
import type { NominationStatus } from '../../domain/votingRoundAggregate/Nomination';

type InfoDto = {
  accountId: AccountIdDto;
  status: NominationStatus;
  nominatedBy: AddressDto;
  nominatedAt: Date;
  statusChangedAt: Date;
};

export type AddressNominationInfoDto = AddressNominationDto & InfoDto;
export type ProjectNominationInfoDto = ProjectNominationDto & InfoDto;
export type DripListNominationInfoDto = DripListNominationDto & InfoDto;

export type NominationInfoDto =
  | AddressNominationInfoDto
  | ProjectNominationInfoDto
  | DripListNominationInfoDto;

export type GetVotingRoundByIdResponse = {
  id: UUID;
  startsAt: Date;
  endsAt: Date;
  dripListId: string | undefined;
  name: string | undefined;
  description: string | undefined;
  publisherAddress: string;
  status: 'started' | 'completed' | 'deleted' | 'linked';
  privateVotes: boolean;
  linkedAt: Date | undefined;
  result: ReceiverDto[] | null; // `null` if the voting round is private or noon has voted yet.
  votes:
    | {
        collaboratorAddress: string;
        votedAt: Date | null;
        latestVote: ReceiverDto[] | null;
      }[]
    | null; // `null` if the voting round is private or noon has voted yet.
  nominationStartsAt: Date | undefined;
  nominationEndsAt: Date | undefined;
  hasVotingPeriodStarted: boolean;
  acceptsNominations: boolean;
  isOpenForNominations: boolean;
  nominations: NominationInfoDto[] | undefined;
};
