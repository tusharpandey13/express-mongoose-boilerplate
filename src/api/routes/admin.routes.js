import express from 'express';
import { auth, login, logout } from '~/middlewares/auth';

const router = express.Router();

import crudControllerClass from '~/utils/crud/crud.controller';
import model from '~/models/user';
const crudController = new crudControllerClass({
  model: model,
});

export default async app => {
  app.get('/', async (req, res, next) => {
    res.redirect('/admin/');
  });

  router.get('/', async (req, res, next) => {
    res.render('index');
  });

  router.get('/login', async (req, res, next) => {
    const msg = req.flash('loginMessage');

    res.render('login', { message: msg.length > 0 ? msg : req.cookies.message });
  });

  router.post(
    '/login',
    login,
    async (req, res, next) => {
      if (req.isAuthenticated) return res.redirect('/admin/home');
      else next('Invalid Credentials');
    },
    async (err, req, res, next) => {
      req.flash('loginMessage', err.toResponseJSON().message ?? 'Error loggin in');
      res.redirect('/admin/login');
    }
  );

  router.get('/logout', logout, async (req, res, next) => {
    res.cookie('message', 'Logged Out');
    res.redirect('/admin/login');
  });

  router.get('/signup', async (req, res, next) => {
    res.render('signup', { message: req.flash('signupMessage') });
  });

  router.post(
    '/signup',
    async (req, res, next) => {
      try {
        await crudController.create({ returnMiddleware: false, data: req });
        req.flash('loginMessage', 'Account created!');
        return res.redirect('/admin/login');
      } catch (err) {
        return next(err);
      }
    },
    async (err, req, res, next) => {
      req.flash('signupMessage', err.toString() ?? 'Error signing up');
      return res.redirect('/admin/signup');
    }
  );

  router.get('/home', auth(), async (req, res, next) => {
    res.render('home');
  });

  app.use('/admin', router);
};
