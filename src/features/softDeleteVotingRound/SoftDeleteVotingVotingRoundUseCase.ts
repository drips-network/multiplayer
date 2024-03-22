import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError } from '../../application/errors';
import type { SoftDeleteVotingRoundRequest } from './SoftDeleteVotingVotingRoundRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
import Auth from '../../application/Auth';
import { assertIsAddress } from '../../domain/typeUtils';

type SoftDeleteVotingRoundCommand = SoftDeleteVotingRoundRequest & {
  id: UUID;
};

export default class SoftDeleteVotingRoundUseCase
  implements UseCase<SoftDeleteVotingRoundCommand>
{
  private readonly _logger: Logger;
  private readonly _repository: IVotingRoundRepository;

  public constructor(logger: Logger, repository: IVotingRoundRepository) {
    this._logger = logger;
    this._repository = repository;
  }

  public async execute(request: SoftDeleteVotingRoundCommand): Promise<void> {
    const { id, signature, publisherAddress, date } = request;

    this._logger.info(`Deleting the current voting round with ID '${id}'...`);

    const votingRound = await this._repository.getById(id);

    if (!votingRound) {
      throw new NotFoundError('voting round not found.');
    }

    assertIsAddress(publisherAddress);

    Auth.verifyMessage(
      Auth.DELETE_VOTING_ROUND_MESSAGE_TEMPLATE(
        new Date(date),
        publisherAddress,
        votingRound._id,
      ),
      signature,
      publisherAddress,
      new Date(date),
    );

    await this._repository.softRemove(votingRound);

    this._logger.info(
      `Deleted successfully the current voting round with ID '${id}'.`,
    );
  }
}
