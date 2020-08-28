import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import flash from 'connect-flash';

import routes from '~/api/routes';
import { normalizePort } from '~/utils';
import { genericErrorHandler, notFound } from '~/middlewares/errorhandler';
import { PORT } from '~/config';

export default async (app, db, passport, session) => {
  await app.set('PORT', normalizePort(PORT));

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
  await app.use(session.session);
  await app.use(flash());

  await app.use(passport.initialize());
  await app.use(passport.session());

  await app.use(express.urlencoded({ extended: true }));
  await app.use(express.json());

  await app.set('view engine', 'ejs');
  await app.set('views', `${__dirname}/src/views`);
  await app.use(express.static('src/public'));
  await app.use(express.static('src/assets'));
  await app.use(express.static('src/uploads'));

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
  await routes(app, db);

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
      await db.dropDatabase(console.log(`${db.databaseName} database dropped.`));
      session.redisClient.flushdb(function (err, succeeded) {
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
