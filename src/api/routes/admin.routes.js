import express from 'express';
import { auth, login, logout } from '~/middlewares/auth';

const router = express.Router();

import crudControllerClass from '~/utils/crud/crud.controller';
import model from '~/models/user';
const crudController = new crudControllerClass({
  model: model,
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
      req.flash('loginerror', err.toResponseJSON().message ?? 'Error loggin in');
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

  app.use('/admin', router);
};
