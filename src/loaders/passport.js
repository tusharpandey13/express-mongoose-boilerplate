import passport from 'passport';
import passportLocal from 'passport-local';

import model from '~/models/user';

export default async () => {
  // configure passport.js to use the local strategy
  const LocalStrategy = passportLocal.Strategy;
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        const user = await model.findAndCheck({ email: email, password: password });
        return user ? done(null, user) : done(null, false, { message: 'Invalid credentials.\n' });
      } catch (err) {
        return done(err, false);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await model.findById(id).exec();
      done(null, user);
    } catch (err) {
      done(err, false);
    }
  });

  return passport;
};
