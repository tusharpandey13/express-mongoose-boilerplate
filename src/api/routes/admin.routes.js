import express from 'express';
import auth from '~/middlewares/auth';

const router = express.Router();

export default async app => {
  app.get('/', async (req, res, next) => {
    res.redirect('/admin/');
  });

  router.get('/', async (req, res, next) => {
    res.render('index');
  });

  router.get('/login', async (req, res, next) => {
    res.render('login', { message: req.flash('loginMessage') });
  });
  router.post('/login', async (req, res, next) => {
    try {
      // let tmp = await userService.login(req.body);
      // res.cookie('token', tmp.token, { httpOnly: true });
      res.redirect('/admin/customers');
    } catch (err) {
      next(err);
    }
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

  app.use('/admin', router);
};
