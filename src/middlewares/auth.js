import httpStatus from 'http-status-codes';
import customError from '~/utils/customError';
import model from '~/models/user';

export default (roles = model.roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(
        new customError({
          message: 'Forbidden',
          status: httpStatus.FORBIDDEN,
          logLevel: 'warn',
        })
      );
    }
    next();
  };
};
