export class InvalidVotingRoundOperationError extends Error {
  public constructor(message: string = 'Invalid operation on VotingRound.') {
    super(message);
    this.name = 'InvalidVotingRoundOperationError';
  }
}

export class InvalidArgumentError extends Error {
  public constructor(message: string = 'Invalid argument.') {
    super(message);
    this.name = 'InvalidArgumentError';
  }
}

export class DomainError extends Error {
  public constructor(message: string = 'Domain error occurred') {
    super(message);
    this.name = 'DomainError';
  }
}
