import passport from 'passport';
import httpStatus from 'http-status-codes';
import customError from '~/utils/customError';
import model from '~/models/user';

export const auth = (roles = model.roles) => {
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

export const login = async (req, res, next) => {
  await passport.authenticate('local', (err, user, info) => {
    if (info) return res.send(info.message);
    if (err || !user) return next(err ?? 'User not found at auth');
    req.login(user, err => {
      // if (err) req.flash('loginMessage', 'Invalid Credentials');
      return next();
    });
  })(req, res, next);
};

export const logout = async (req, res, next) => {
  // var expireTime = new Date(req.session.cookie.expires) - new Date();
  try {
    // req.flash('loginMessage', 'Logged Out');
    await req.logout();
    req.session.destroy(function () {
      return next();
    });
  } catch (err) {
    return next(err);
  }
};
