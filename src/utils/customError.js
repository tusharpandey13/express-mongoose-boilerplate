import HttpStatus from 'http-status-codes';
import cleanStack from 'clean-stack';
import colors from 'colors';

class CustomError extends Error {
  constructor({
    message = HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR),
    status = HttpStatus.INTERNAL_SERVER_ERROR,
    details = undefined,
    err = undefined,
    logLevel = 'error',
  }) {
    // Calling parent constructor of base Error class.
    if (err) {
      super(err.message ?? message, err.filename, err.lineNumber);
    } else {
      super(message);
    }

    // Saving class name in the property of our custom error as a shortcut.
    this.name = this.constructor.name;

    this.message = err ? err.message ?? message : message;
    this.details = details ?? (err && err.errors && err.errors) ?? (err && err.details && err.details);
    this.status = err ? err.status ?? status : status;
    this.logLevel = err ? err.logLevel ?? logLevel : logLevel;

    Error.stackTraceLimit = 20;
    Error.captureStackTrace(this, this.constructor);
    this.stack = this.stack
      .split('\n')
      .map((e, i) => {
        if (!i) return '';
        e = e.trim();
        let str;
        if (e.includes('/node_modules/')) {
          if (this.logLevel === 'error') {
            str = `${colors.grey(e)}\n`;
          } else return '';
        } else str = `${e}\n`;
        return `  ${str}`;
      })
      .join('');
    this.stack = cleanStack(this.stack, { basePath: __dirname });
  }

  toString() {
    if (process.env['NODE_ENV'] !== 'production') {
      return {
        ...(this.details && { details: this.details }),
        stack: this.stack,
      };
    }
    return {};
  }

  toResponseJSON() {
    return {
      success: false,
      status: this.status,
      message: this.message,
      ...(this.details && { details: this.details }),
      logLevel: this.logLevel,
    };
  }
}

export default CustomError;
