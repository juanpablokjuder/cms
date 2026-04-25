/**
 * Typed application error that carries an HTTP status code.
 * Throw this anywhere in services/repositories; the global error
 * handler will serialise it into the standard API envelope.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;

    // Maintains correct prototype chain in compiled ES5 output.
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError(`${resource} not found.`, 404, 'NOT_FOUND');
  }

  static unauthorized(message = 'Unauthorized.'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Forbidden.'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, 'CONFLICT');
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400, 'BAD_REQUEST');
  }
}
