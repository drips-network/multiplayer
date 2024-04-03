import type {
  AddressReceiverDto,
  DripListReceiverDto,
  ProjectReceiverDto,
} from '../../application/dtos';

export type AddressNominationDto = Omit<AddressReceiverDto, 'weight'>;
export type ProjectNominationDto = Omit<ProjectReceiverDto, 'weight'>;
export type DripListNominationDto = Omit<DripListReceiverDto, 'weight'>;

export type NominationDto =
  | AddressNominationDto
  | ProjectNominationDto
  | DripListNominationDto;

export type NominateRequest = {
  nomination: NominationDto;
};
