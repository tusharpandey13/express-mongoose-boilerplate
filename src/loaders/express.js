import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import flash from 'connect-flash';

import routes from '~/api/routes';
import { genericErrorHandler, notFound } from '~/middlewares/errorhandler';

export default async (app, db, passport, session) => {
  // cors, helmet, compression
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

  // cookieparser, session, flash
  await app.use(cookieParser()); // read cookies (needed for auth)
  await app.use(session.session);
  await app.use(flash());

  // passport
  await app.use(passport.initialize());
  await app.use(passport.session());

  // json, urlencoded
  await app.use(express.urlencoded({ extended: true }));
  await app.use(express.json());

  // views
  await app.set('view engine', 'ejs');
  await app.set('views', `${__dirname}/src/views`);
  await app.use(express.static('src/public'));
  await app.use(express.static('src/assets'));
  await app.use(express.static('src/uploads'));

  // await app.use(function (req, res, next) {
  // res.locals.error = req.flash('error');
  // res.locals.success = req.flash('success');
  // res.locals.moment = moment;
  //   next();
  // });

  // custom request logger middleware
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
      options = {
        ...options,
        ...(this.req.user && { currentUser: this.req.user }),
      };
      _render.apply(this, [view, options, callback]);
    } catch (err) {
      __logger.error(err);
    }
  };

  // Error Middleware
  app.use(notFound);
  app.use(genericErrorHandler);
};
