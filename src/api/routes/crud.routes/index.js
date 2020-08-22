const router = require('express').Router();

class crudRouteClass {
  constructor(app) {
    this._app = app;
  }

  async use({ path, model, schema = undefined, id = '_id' }) {
    try {
      const _crudController = require('../controllers/crud')({
        model: model,
        schema: schema,
        idfield: id,
      });

      router.post('/create', await _crudController.create({}));
      router.get('/get', await _crudController.get({}));
      router.post('/update', await _crudController.update({}));
      router.delete('/remove', await _crudController.remove({}));

      await this._app.use(path, router);
    } catch (err1) {
      try {
        next(err1);
      } catch (err) {
        throw err1;
      }
    }
  }
}

module.exports = app => {
  return new crudRouteClass(app);
};
