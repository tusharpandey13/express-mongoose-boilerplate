import express from 'express';
import auth from '~/middlewares/auth';

import passport from 'passport';
import bcrypt from 'bcryptjs';

import crudControllerClass from '~/utils/crud/crud.controller';
import model from '~/models/user';

const router = express.Router();
const crudController = new crudControllerClass({
  model: model,
});

export default async app => {
  router.post('/create', await crudController.create({}));
  router.get('/get', auth(), await crudController.get({}));
  router.post(
    '/update',
    auth(),
    await crudController.update({
      pre_cb: async (model, data) => {
        data.body.password = bcrypt.hashSync(data.body.password);
        return data;
      },
    })
  );
  router.delete('/remove', auth(), await crudController.remove({}));

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

  router.get('/logout', auth(), async (req, res, next) => {
    // var expireTime = new Date(req.session.cookie.expires) - new Date();
    req.logout();
    req.session.destroy(function () {
      res.send('logged out!');
    });
  });

  app.use('/api/user', router);
};
