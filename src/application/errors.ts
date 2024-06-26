export class NotFoundError extends Error {
  public constructor(message: string = 'Not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends Error {
  public constructor(message: string = 'Bad request.') {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends Error {
  public constructor(message: string = 'Unauthorized.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}
