import CustomError from '~/utils/customError';
import * as HttpStatus from 'http-status-codes';

/**
 * Error response middleware for 404 not found.
 *
 * @param {Object} req
 * @param {Object} res
 */
export const notFound = (req, res, next) => {
  next(
    new CustomError(HttpStatus.getStatusText(HttpStatus.NOT_FOUND), HttpStatus.NOT_FOUND, '', 'warn')
  );
};

/**
 * Generic error response middleware for validation and internal server errors.
 *
 * @param  {Object}   err
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
export const genericErrorHandler = (err, req, res, next) => {
  let tmperr;

  if (err instanceof CustomError) {
    tmperr = err;
  } else {
    // Validation errors
    if (err.name === 'ValidationError' || err.isJoi) {
      tmperr = new CustomError(
        err.message,
        HttpStatus.BAD_REQUEST,
        err.details &&
          err.details.map(err => {
            return {
              message: err.message,
              path: err.path.join('.'),
            };
          })
      );
    } else if (err.name === 'UnauthorizedError') {
      tmperr = new CustomError(err.message || 'Invalid token', 401);
    }
    // HTTP errors
    else if (err.isBoom) {
      tmperr = new CustomError(
        err.output.payload.message || err.output.payload.error,
        err.output.statusCode
      );
    } else {
      tmperr = new CustomError(err.message, err.status, err.details, err.logLevel);
    }
  }
  console.error(tmperr.logLevel, {
    ...tmperr.toResponseJSON(),
    path: req.originalUrl,
    method: req.method,
    'user-agent': req.headers['user-agent'],
    origin: req.headers.origin,
  });

  if (process.env['NODE_ENV'] !== 'production') {
    console.error(tmperr);
  }

  return res.status(tmperr.status).json(tmperr.toResponseJSON());
};
