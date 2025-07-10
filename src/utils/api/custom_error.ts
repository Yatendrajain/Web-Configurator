export class CustomAPIError extends Error {
  public readonly statusCode: number;
  public readonly clientMessage: string;
  public readonly innerError: { message: string } | unknown;
  public readonly stack: string | undefined;

  constructor({
    clientMessage = "Something went wrong!",
    innerError,
    statusCode = 500,
  }: {
    clientMessage?: string;
    innerError: unknown;
    statusCode?: number;
  }) {
    const internalMsg =
      innerError instanceof Error ? innerError.message : String(innerError);

    super(internalMsg);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);

    this.clientMessage = clientMessage;
    this.statusCode = statusCode;
    if (innerError instanceof Error) {
      this.innerError = { message: innerError.message };
      this.stack = innerError.stack;
    } else {
      this.innerError = innerError;
    }
  }
}
