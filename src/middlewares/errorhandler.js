import CustomError from '~/utils/customError';
import * as HttpStatus from 'http-status-codes';

/**
 * Error response middleware for 404 not found.
 */
export const notFound = (req, res, next) => {
  next(
    new CustomError({
      message: HttpStatus.getStatusText(HttpStatus.NOT_FOUND),
      status: HttpStatus.NOT_FOUND,
      logLevel: 'warn',
    })
  );
};

/**
 * Generic error response middleware for validation and internal server errors.
 */
export const genericErrorHandler = (err, req, res, next) => {
  let tmperr;

  let errParams = { err: err };

  if (err instanceof CustomError) {
    tmperr = err;
  } else {
    // Validation errors
    if (err.name === 'ValidationError' || err.isJoi) {
      errParams = {
        ...errParams,
        ...{
          status: HttpStatus.BAD_REQUEST,
        },
      };
    } else if (err.name === 'UnauthorizedError') {
      errParams = {
        ...errParams,
        ...{
          message: 'Invalid token',
          status: HttpStatus.UNAUTHORIZED,
        },
      };
    }

    tmperr = new CustomError(errParams);
  }

  console.error(tmperr.logLevel, {
    ...tmperr.toResponseJSON(),
    path: req.originalUrl,
    method: req.method,
    'user-agent': req.headers['user-agent'],
    origin: req.headers.origin,
  });

  if (process.env['NODE_ENV'] !== 'production') console.error(tmperr);

  return res.status(tmperr.status).json(tmperr.toResponseJSON());
};
