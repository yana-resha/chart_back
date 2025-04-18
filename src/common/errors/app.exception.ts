export class AppException extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly payload?: any, // если хочешь передавать ещё какие-то данные
  ) {
    super(message)
  }
}
