export class InvalidVotingRoundOperationError extends Error {
  public constructor(message: string = 'Invalid operation on VotingRound.') {
    super(message);
    this.name = 'InvalidVotingRoundOperationError';
  }
}
