import type {
  AddressDto,
  ImpactMetricDto,
  NominationDto,
} from '../../application/dtos';

export type NominateRequest = {
  date: Date;
  signature: string;
  nominatedBy: AddressDto;
  nomination: NominationDto;
  description: string;
  impactMetrics: ImpactMetricDto[];
};
