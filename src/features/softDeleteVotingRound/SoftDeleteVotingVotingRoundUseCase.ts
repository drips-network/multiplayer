import type { Logger } from 'winston';
import type { UUID } from 'crypto';
import { verifyMessage } from 'ethers';
import type UseCase from '../../application/interfaces/IUseCase';
import { NotFoundError, UnauthorizedError } from '../../application/errors';
import type { SoftDeleteVotingRoundRequest } from './SoftDeleteVotingVotingRoundRequest';
import type IVotingRoundRepository from '../../domain/votingRoundAggregate/IVotingRoundRepository';
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
    const { id, signature, publisherAddress } = request;

    this._logger.info(`Deleting the current voting round with ID '${id}'...`);

    const votingRound = await this._repository.getById(id);

    if (!votingRound) {
      throw new NotFoundError('Voting round not found.');
    }

    this._verifyPublisher(publisherAddress, signature, id);

    await this._repository.softRemove(votingRound);

    this._logger.info(
      `Deleted successfully the current voting round with ID '${id}'.`,
    );
  }

  private _verifyPublisher(
    publisherAddress: string,
    signature: string,
    votingRoundId: UUID,
  ): void {
    assertIsAddress(publisherAddress);

    const reconstructedMessage = `Delete the voting round with ID ${votingRoundId}, owned by ${publisherAddress}. The current time is ${new Date().toISOString()}.`;

    const originalSigner = verifyMessage(reconstructedMessage, signature);

    if (originalSigner.toLowerCase() !== publisherAddress.toLowerCase()) {
      throw new UnauthorizedError('Signature is not valid.');
    }
  }
}
