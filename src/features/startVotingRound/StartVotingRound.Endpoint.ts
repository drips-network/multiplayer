// import type { Request, Response } from 'express';
// import type { UUID } from 'crypto';
// import type StartVotingRoundUseCase from './StartVotingRound.UseCase';
// import type { IEndpoint } from '../../application/interfaces/IEndpoint';
// import type NewVotingRoundRequest from './NewVotingRound.Request';

// export default class StartVotingRoundEndpoint implements IEndpoint {
//   private readonly _startVotingRoundUseCase: StartVotingRoundUseCase;

//   public constructor(startVotingRoundUseCase: StartVotingRoundUseCase) {
//     this._startVotingRoundUseCase = startVotingRoundUseCase;
//   }

//   public async handle(
//     req: Request<any, any, NewVotingRoundRequest>,
//     res: Response<{
//       votingRoundId: UUID;
//     }>,
//   ): Promise<
//     Response<{
//       votingRoundId: UUID;
//     }>
//   > {
//     // TODO: Validate request.

//     const votingRoundId = await this._startVotingRoundUseCase.execute(req.body);

//     return res
//       .status(201)
//       .location(`/voting-rounds/${votingRoundId}`)
//       .json({ votingRoundId });
//   }
// }
