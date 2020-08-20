import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import flash from 'connect-flash';
import session from 'express-session';

import routes from '~/api/routes';
import { normalizePort } from '~/utils';
import { genericErrorHandler, notFound } from '~/middlewares/errorhandler';
import { PORT, SESSION_SECRET } from '~/config';

export default async (app, mongooseDb) => {
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
  await app.use(
    session({
      secret: SESSION_SECRET, // session secret
      resave: true,
      saveUninitialized: true,
    })
  );
  await app.use(flash());

  await app.use(express.urlencoded({ extended: true }));
  await app.use(express.json());

  await app.set('view engine', 'ejs');
  // await app.use(express.static('public'));
  await app.use(express.static('assets'));
  // await app.use(express.static('uploads'));

  app.use(function (req, res, next) {
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    // res.locals.moment = moment;
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
      console.log(err);
    }
  };

  app.get('/ping', (req, res) => {
    res.status(200).send('hi!!');
  });

  // app.get('/cleardb', (req, res) => {
  //   try {
  //     mongooseDb.dropDatabase(console.log(`${mongooseDb.databaseName} database dropped.`));
  //     res.send('Ok');
  //   } catch (err) {
  //     res.send(err);
  //   }
  // });

  // Error Middleware
  app.use(notFound);
  app.use(genericErrorHandler);

  // Create HTTP server object to respond to events.
  var server = app.listen(PORT);

  // // Respond to error event.
  server.on('error', onError);
  console.log(`✌️ Server started on port ${PORT}\t`);
  console.log();

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
