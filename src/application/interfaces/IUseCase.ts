export default interface IUseCase<TRequest, TResponse = void> {
  execute: (req: TRequest) => Promise<TResponse>;
}
