import * as HttpStatus from 'http-status-codes';

class CustomError extends Error {
  constructor({
    message = HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR),
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    details = undefined,
    err = undefined,
    logLevel = 'error',
  }) {
    // Calling parent constructor of base Error class.
    super(message);

    // Capturing stack trace, excluding constructor call from it.
    Error.stackTraceLimit = 20;
    Error.captureStackTrace(this, this.constructor);

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    this.message = err.message ?? message;
    this.details =
      details ?? {
        ...(err && err.errors && { errors: err.errors }),
        ...(err && err.details && { details: err.details }),
      } ??
      {};
    this.status = err.status ?? status;
    this.logLevel = err.logLevel ?? logLevel;
  }

  toResponseJSON() {
    return {
      success: false,
      status: this.status,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

export default CustomError;
