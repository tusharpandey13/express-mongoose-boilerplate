import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import flash from 'connect-flash';
import session from 'express-session';
import { v4 as uuid } from 'uuid';
import redis from 'redis';
import connectRedis from 'connect-redis';
import passport from 'passport';
import passportLocal from 'passport-local';

import routes from '~/api/routes';
import { normalizePort } from '~/utils';
import { genericErrorHandler, notFound } from '~/middlewares/errorhandler';
import { PORT, SESSION_SECRET } from '~/config';

import model from '~/models/user';

export default async (app, mongooseDb) => {
  await app.set('PORT', normalizePort(PORT));

  const redisStore = connectRedis(session);
  const redisClient = redis.createClient();
  redisClient.on('error', err => {
    console.log('Redis error: ', err);
  });
  // configure passport.js to use the local strategy
  const LocalStrategy = passportLocal.Strategy;
  passport.use(
    new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
      try {
        const user = await model.findAndCheck({ username: username, password: password });
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

  await app.use(cors());
  await app.use(helmet());
  await app.use(
    compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
      },
    })
  );

  await app.use(cookieParser()); // read cookies (needed for auth)

  await app.use(
    session({
      secret: SESSION_SECRET, // session secret
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
      genid: req => {
        return uuid();
      },
      store: new redisStore({ host: 'localhost', port: 6379, client: redisClient }),
      name: '_redisStore',
    })
  );
  await app.use(flash());

  await app.use(passport.initialize());
  await app.use(passport.session());

  await app.use(express.urlencoded({ extended: true }));
  await app.use(express.json());

  await app.set('view engine', 'ejs');
  // await app.use(express.static('public'));
  await app.use(express.static('assets'));
  // await app.use(express.static('uploads'));

  await app.use(function (req, res, next) {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    // res.locals.moment = moment;
    next();
  });

  await app.use(async (req, res, next) => {
    __logger.http(
      `${req.method}  ${req.path}  ${req.headers['x-forwarded-for'] || req.connection.remoteAddress}`
    );
    next();
  });

  // Routes
  await routes(app, mongooseDb);

  // express.response.render hook :P
  const _render = express.response.render;
  express.response.render = function (view, options, callback) {
    /** here this refer to the current res instance and you can even access req for this res: **/
    try {
      options = { ...options, ...(this.req.user && { currentUser: this.req.user }) };
      _render.apply(this, [view, options, callback]);
    } catch (err) {
      __logger.error(err);
    }
  };

  app.get('/ping', (req, res) => {
    res.status(200).send('hi!!');
  });

  app.get('/cleardb', async (req, res) => {
    try {
      await mongooseDb.dropDatabase(console.log(`${mongooseDb.databaseName} database dropped.`));
      redisClient.flushdb(function (err, succeeded) {
        console.log(succeeded); // will be true if successfull
        console.log(err);
      });
      res.send('Ok');
    } catch (err) {
      res.send(err);
    }
  });

  // Error Middleware
  app.use(notFound);
  app.use(genericErrorHandler);

  // Create HTTP server object to respond to events.
  var server = app.listen(PORT);

  // // Respond to error event.
  server.on('error', onError);
  __logger.log('info', `✌️ Server started on port ${PORT}\t\n\n`);

  // // Catch unhandled rejections
  process.on('unhandledRejection', err => {
    console.error('Unhandled rejection', err);
    //   // logger.error('Unhandled rejection', err);
    process.exit(1);
  });

  // // Catch uncaught exceptions
  process.on('uncaughtException', err => {
    console.error('Uncaught exception', err);
    process.exit(1);
  });

  // // Event listener for HTTP server "error" event.
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    // // handle specific listen errors with friendly messages

    if (error.code === 'EACCES') {
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    } else if (error.code === 'EADDRINUSE') {
      console.error(bind + ' is already in use');
      process.exit(1);
    } else {
      throw error;
    }
  }
};
