import express from 'express';
import { auth, login, logout } from '~/middlewares/auth';

const router = express.Router();

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

  router.post('/login', login, async (req, res, next) => {
    try {
      if (req.isAuthenticated) return res.render('home');
      req.flash('loginMessage', 'Invalid credentials');
      return res.redirect('/admin/login');
    } catch (err) {
      return next(err);
    }
  });

  router.get('/logout', logout, async (req, res, next) => {
    res.cookie('message', 'Logged Out');
    res.redirect('/admin/login');
  });

  router.get('/signup', async (req, res, next) => {
    res.render('signup', { message: req.flash('signupMessage') });
  });
  router.post('/signup', async (req, res, next) => {
    try {
      // let tmp = await userService.login(req.body);
      // res.cookie('token', tmp.token, { httpOnly: true });
      res.redirect('/admin/login');
    } catch (err) {
      next(err);
    }
  });

  router.get('/home', auth(), async (req, res, next) => {
    res.render('home');
  });

  app.use('/admin', router);
};
