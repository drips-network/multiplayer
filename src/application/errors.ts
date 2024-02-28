export class NotFoundError extends Error {
  public constructor(message: string = 'Not found.') {
    super(message);
    this.name = 'NotFoundError';
  }
}
