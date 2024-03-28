import type {
  AddressReceiverDto,
  DripListReceiverDto,
  ProjectReceiverDto,
} from '../../application/dtos/ReceiverDto';

type AddressNominationDto = Omit<AddressReceiverDto, 'weight'>;
type ProjectNominationDto = Omit<ProjectReceiverDto, 'weight'>;
type DripListNominationDto = Omit<DripListReceiverDto, 'weight'>;

export type NominationDto =
  | AddressNominationDto
  | ProjectNominationDto
  | DripListNominationDto;

export type NominateRequest = {
  nomination: NominationDto;
};
