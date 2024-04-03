import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import type { SetNominationsStatusesRequest } from './SetNominationsStatusesRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { NotFoundError } from '../../application/errors';
import Auth from '../../application/Auth';
import { toAccountId } from '../../domain/typeUtils';

type SetNominationsStatusesCommand = SetNominationsStatusesRequest & {
  votingRoundId: UUID;
};

export default class SetNominationsStatusesUseCase
  implements UseCase<SetNominationsStatusesCommand>
{
  private readonly _logger: Logger;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
  ) {
    this._logger = logger;
    this._votingRoundRepository = votingRoundRepository;
  }

  public async execute(command: SetNominationsStatusesCommand): Promise<void> {
    const {
      votingRoundId,
      date,
      nominations: nominationDtos,
      signature,
    } = command;

    this._logger.info(
      `Setting nominations statuses for voting round '${votingRoundId}' to '${JSON.stringify(
        nominationDtos,
        null,
        2,
      )}'...`,
    );

    const votingRound =
      await this._votingRoundRepository.getById(votingRoundId);

    if (!votingRound) {
      throw new NotFoundError(`voting round not found.`);
    }

    const nominations = nominationDtos.map((n) => ({
      accountId: toAccountId(n.accountId),
      status: n.status,
    }));

    await Auth.verifyMessage(
      Auth.SET_NOMINATION_STATUS_MESSAGE(
        votingRound._publisher._address,
        votingRoundId,
        new Date(date),
        nominations,
      ),
      signature,
      votingRound._publisher._address,
      new Date(date),
      this._logger,
    );

    votingRound.setNominationsStatuses(nominations);

    await this._votingRoundRepository.save(votingRound);

    this._logger.info(
      `Nominations for voting round '${votingRoundId}' successfully set.`,
    );
  }
}
