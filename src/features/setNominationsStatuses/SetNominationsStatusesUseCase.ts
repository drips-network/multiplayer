import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import type { SetNominationsStatusesRequest } from './SetNominationsStatusesRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import { NotFoundError } from '../../application/errors';
import type { IAuthStrategy } from '../../application/Auth';
import { SET_NOMINATION_STATUS_MESSAGE_TEMPLATE } from '../../application/Auth';
import { toAccountId } from '../../domain/typeUtils';

export type SetNominationsStatusesCommand = SetNominationsStatusesRequest & {
  votingRoundId: UUID;
};

export default class SetNominationsStatusesUseCase
  implements UseCase<SetNominationsStatusesCommand>
{
  private readonly _logger: Logger;
  private readonly _auth: IAuthStrategy;
  private readonly _votingRoundRepository: IVotingRoundRepository;

  public constructor(
    logger: Logger,
    votingRoundRepository: IVotingRoundRepository,
    auth: IAuthStrategy,
  ) {
    this._auth = auth;
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

    const message = SET_NOMINATION_STATUS_MESSAGE_TEMPLATE(
      votingRound._publisher._address,
      votingRoundId,
      date,
      nominations,
      votingRound._chainId,
    );

    await this._auth.verifyMessage(
      message,
      signature,
      votingRound._publisher._address,
      date,
      votingRound._chainId,
    );

    votingRound.setNominationsStatuses(nominations);

    await this._votingRoundRepository.save(votingRound);

    this._logger.info(
      `Nominations for voting round '${votingRoundId}' successfully set.`,
    );
  }
}
