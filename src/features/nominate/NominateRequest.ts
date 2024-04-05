import type {
  AddressDto,
  AddressReceiverDto,
  DripListReceiverDto,
  ProjectReceiverDto,
} from '../../application/dtos';

export type AddressNominationDto = Omit<AddressReceiverDto, 'weight'>;
export type ProjectNominationDto = Omit<ProjectReceiverDto, 'weight'>;
export type DripListNominationDto = Omit<DripListReceiverDto, 'weight'>;

export type ImpactMetricDto = {
  [key: string]: string | number;
};

export type NominationDto =
  | AddressNominationDto
  | ProjectNominationDto
  | DripListNominationDto;

export type NominateRequest = {
  date: Date;
  signature: string;
  nominatedBy: AddressDto;
  nomination: NominationDto;
  description: string;
  impactMetrics: ImpactMetricDto[];
};
