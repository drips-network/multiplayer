import type { Response } from 'express';
import type { UUID } from 'crypto';
import type { IEndpoint } from '../../application/interfaces/IEndpoint';
import type DeleteVotingRoundUseCase from './DeleteVotingRoundUseCase';
import type { TypedResponse } from '../../application/interfaces/ITypedResponse';
import type { DeleteVotingRoundResponse } from './DeleteVotingRoundResponse';
import type { TypedRequestParams } from '../../application/interfaces/ITypedRequestParams';

export default class DeleteVotingRoundEndpoint implements IEndpoint {
  private readonly _startVotingRoundUseCase: DeleteVotingRoundUseCase;

  public constructor(startVotingRoundUseCase: DeleteVotingRoundUseCase) {
    this._startVotingRoundUseCase = startVotingRoundUseCase;
  }

  public async handle(
    req: TypedRequestParams<{
      draftDripListId: UUID;
    }>,
    res: TypedResponse<DeleteVotingRoundResponse>,
  ): Promise<Response<DeleteVotingRoundResponse>> {
    const startVotingRoundResult = await this._startVotingRoundUseCase.execute({
      draftDripListId: req.params.draftDripListId,
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
    });

    return res.status(201).json(startVotingRoundResult);
  }
}
