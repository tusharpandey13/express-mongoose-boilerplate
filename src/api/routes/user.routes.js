import express from 'express';
import jsonwebtoken from 'jsonwebtoken';
import passport from 'passport';

import crudControllerClass from '~/utils/crud/crud.controller';
import model from '~/models/user';
import { JWT_SECRET } from '~/config';

const router = express.Router();
const crudController = new crudControllerClass({
  model: model,
});

export default async app => {
  router.post('/create', await crudController.create({}));
  router.get('/get', await crudController.get({}));
  router.post('/update', await crudController.update({}));
  router.delete('/remove', await crudController.remove({}));

  router.post('/login', async (req, res, next) => {
    var expireTime = new Date(req.session.cookie.expires) - new Date();
    passport.authenticate('local', (err, user, info) => {
      if (info) {
        return res.send(info.message);
      }
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send('err');
      }
      req.login(user, err => {
        if (err) {
          return next(err);
        }
        res.json({
          sessionID: req.sessionID,
          sessionExpireTime: expireTime,
          id: req.user.id,
          error: null,
          isAuthenticated: req.isAuthenticated(),
          username: req.isAuthenticated() ? req.user.username : null,
        });
      });
    })(req, res, next);
  });

  router.get('/logout', async (req, res, next) => {
    // var expireTime = new Date(req.session.cookie.expires) - new Date();
    req.logout();
    req.session.destroy(function () {
      res.send('logged out!');
    });
  });

  app.use('/api/user', router);
};
