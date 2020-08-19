import * as HttpStatus from 'http-status-codes';

class CustomError extends Error {
  constructor({
    message = HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR),
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    details = undefined,
    logLevel = 'error',
  }) {
    // Calling parent constructor of base Error class.
    super(message);

    // Capturing stack trace, excluding constructor call from it.
    Error.stackTraceLimit = 20;
    Error.captureStackTrace(this, this.constructor);
    // console.trace('Here I am!');

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    this.message = message;
    this.details = details;
    this.status = status;
    this.logLevel = logLevel;
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
