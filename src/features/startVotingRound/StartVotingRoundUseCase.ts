import type { Repository } from 'typeorm';
import type { Logger } from 'winston';
import type UseCase from '../../application/interfaces/IUseCase';
import type { StartVotingRoundResponse } from './StartVotingRoundResponse';
import type { StartVotingRoundRequest } from './StartVotingRoundRequest';
import { NotFoundError } from '../../application/errors';
import type DraftDripList from '../../domain/draftDripListAggregate/DraftDripList';

export default class StartVotingRoundUseCase
  implements UseCase<StartVotingRoundRequest, StartVotingRoundResponse>
{
  private readonly _logger: Logger;
  private readonly _repository: Repository<DraftDripList>;

  public constructor(logger: Logger, repository: Repository<DraftDripList>) {
    this._logger = logger;
    this._repository = repository;
  }

  public async execute(
    request: StartVotingRoundRequest,
  ): Promise<StartVotingRoundResponse> {
    // TODO: Verify the request is coming from the publisher by checking the signature token.

    const { id, startsAt, endsAt } = request;

    this._logger.info(
      `Starting a new voting round for the draft drip list with ID '${id}'.`,
    );

    const draftDripList = await this._repository.findOne({
      where: { _id: id },
      relations: ['_votingRounds'],
    });

    if (!draftDripList) {
      throw new NotFoundError('DraftDripList not found.');
    }

    draftDripList.startVotingRound(startsAt, endsAt);

    await this._repository.save(draftDripList);

    const votingRoundId = draftDripList.currentVotingRound!._id;

    this._logger.info(
      `Started successfully a new voting round with ID '${votingRoundId}'.`,
    );

    return {
      votingRoundId,
    };
  }
}
