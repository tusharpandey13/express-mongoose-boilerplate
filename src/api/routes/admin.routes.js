import express from 'express';
import { auth, login, logout, googleauth, googleauthredirect } from '~/middlewares/auth';
import customError from '~/utils/customError';

const router = express.Router();

import crudControllerClass from '~/utils/crud/crud.controller';
import model from '~/models/user';
import { googleValidation } from '~/validations/user.validation';

const crudController = new crudControllerClass({
  model: model,
  validation: googleValidation,
});

const invalidatestr = str => (str.length > 0 ? str : undefined);

export default async app => {
  app.get('/', async (req, res, next) => {
    res.redirect('/admin/');
  });

  router.get('/', async (req, res, next) => {
    res.render('index');
  });

  router.get('/login', async (req, res, next) => {
    const errorMessage = invalidatestr(req.flash('loginerror')) ?? req.cookies.loginerror;
    const successMessage = invalidatestr(req.flash('loginsuccess')) ?? req.cookies.loginsuccess;
    const infoMessage = invalidatestr(req.flash('logininfo')) ?? req.cookies.logininfo;

    res.cookie('loginerror', '', { maxAge: 0 });
    res.cookie('loginsuccess', '', { maxAge: 0 });
    res.cookie('logininfo', '', { maxAge: 0 });

    res.render('login', {
      errorMessage: errorMessage,
      successMessage: successMessage,
      infoMessage: infoMessage,
    });
  });

  router.post(
    '/login',
    login,
    async (req, res, next) => {
      if (req.isAuthenticated) return res.redirect('/admin/home');
      else next('Invalid Credentials');
    },
    async (err, req, res, next) => {
      console.log(err);
      let errstr;
      if (err instanceof customError) errstr = err.toResponseJSON().message;
      else {
        if (err.toString().includes('Illegal arguments: string, undefined'))
          errstr = 'Please register first!';
        else errstr = err.toString();
      }
      req.flash('loginerror', errstr ?? 'Error loggin in');
      res.redirect('/admin/login');
    }
  );

  router.get('/logout', logout, async (req, res, next) => {
    res.cookie('logininfo', 'Logged Out');
    res.redirect('/admin/login');
  });

  router.get('/signup', async (req, res, next) => {
    const errorMessage = invalidatestr(req.flash('signuperror')) ?? req.cookies.signuperror;
    const successMessage = invalidatestr(req.flash('signupsuccess')) ?? req.cookies.signupsuccess;
    const infoMessage = invalidatestr(req.flash('signupinfo')) ?? req.cookies.signupinfo;

    res.cookie('signuperror', '', { maxAge: 0 });
    res.cookie('signupsuccess', '', { maxAge: 0 });
    res.cookie('signupinfo', '', { maxAge: 0 });

    res.render('signup', {
      errorMessage: errorMessage,
      successMessage: successMessage,
      infoMessage: infoMessage,
    });
  });

  router.post(
    '/signup',
    async (req, res, next) => {
      try {
        await crudController.create({ returnMiddleware: false, data: req });
        req.flash('logininfo', 'Account created!');
        return res.redirect('/admin/login');
      } catch (err) {
        return next(err);
      }
    },
    async (err, req, res, next) => {
      req.flash('signuperror', err.toString() ?? 'Error signing up');
      return res.redirect('/admin/signup');
    }
  );

  router.get('/home', auth(), async (req, res, next) => {
    res.render('home');
  });

  app.get('/auth/google', googleauth);
  app.get('/auth/google/redirect', googleauthredirect, async (req, res, next) => {
    return res.redirect('/admin/home');
  });

  app.use('/admin', router);
};
