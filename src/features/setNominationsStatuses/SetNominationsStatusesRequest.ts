import type { NominationStatus } from '../../domain/votingRoundAggregate/Nomination';
import type { AccountIdDto } from '../../application/dtos';

export type SetNominationsStatusesRequest = {
  signature: string;
  date: Date;
  nominations: {
    accountId: AccountIdDto;
    status: NominationStatus;
  }[];
};
