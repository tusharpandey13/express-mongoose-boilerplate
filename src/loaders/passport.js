import passport from 'passport';
import passportLocal from 'passport-local';
import googleoauth from 'passport-google-oauth20';

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ENABLE_GOOGLE_AUTH } from '~/config';

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

  if (ENABLE_GOOGLE_AUTH) {
    const GoogleStrategy = googleoauth.Strategy;
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: '/auth/google/redirect',
        },
        (accessToken, refreshToken, profile, done) => {
          // passport callback function
          //check if user already exists in our db with the given profile ID
          model
            .findOne({ $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] })
            .then(currentUser => {
              if (currentUser) {
                //if we already have a record with the given profile ID
                done(null, currentUser);
              } else {
                //if not, create a new user
                new model({
                  googleId: profile.id,
                  email: profile.emails[0].value,
                  name: profile.displayName,
                  details: {
                    googleProfile: profile,
                  },
                })
                  .save()
                  .then(newUser => {
                    done(null, newUser);
                  });
              }
            });
        }
      )
    );
  }

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
