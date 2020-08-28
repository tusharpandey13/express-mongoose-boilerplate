import express from 'express';
import { auth, login, logout } from '~/middlewares/auth';

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

  router.post('/login', login, async (req, res, next) => {
    res.json({
      sessionID: req.sessionID,
      sessionExpireTime: new Date(req.session.cookie.expires) - new Date(),
      id: req.user.id,
      error: null,
      isAuthenticated: req.isAuthenticated(),
      username: req.isAuthenticated() ? req.user.username : null,
    });
  });
  router.get('/logout', auth(), logout);

  app.use('/api/user', router);
};
