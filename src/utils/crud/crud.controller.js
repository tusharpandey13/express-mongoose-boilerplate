export default class {
  constructor({ model, idfield = '_id', schema = undefined, returnMiddleware = true }) {
    this._model = model;
    this._idfield = idfield;
    this._schema = schema;
    this._returnMiddleware = returnMiddleware;
  }

  async _fragment(fn, returnMiddleware, data, pre_cb, post_cb) {
    const _returnMiddleware = returnMiddleware || this._returnMiddleware;
    const _cb = async (model, data) => {
      pre_cb && (await pre_cb(model, data));
      const result = await fn(data);
      if (post_cb) {
        return (await post_cb(model, result, data)) ?? result;
      }
      return result;
    };
    if (_returnMiddleware) {
      return async (req, res, next) => {
        try {
          req.query['id'] && delete Object.assign(req.query, { _id: req.query['id'] })['id'];
          res
            .status(200)
            .json({
              success: true,
              result: await _cb(this._model, req),
            })
            .end();
        } catch (err) {
          next(err);
        }
      };
    } else if (!_returnMiddleware && data) {
      return {
        success: true,
        result: await _cb(this._model, data),
      };
    } else {
      throw 'No data given to raw crud function';
    }
  }

  async create({
    returnMiddleware = undefined,
    data = undefined,
    pre_cb = undefined,
    post_cb = undefined,
  }) {
    const fn = async data => {
      this._schema && this._schema.validate(data.body);
      return await this._model.create(data.body);
    };
    return await this._fragment(fn, returnMiddleware, data, pre_cb, post_cb);
  }

  async get({
    idfield = undefined,
    filter = undefined,
    filterActive = true,
    returnMiddleware = undefined,
    data = undefined,
    pre_cb = undefined,
    post_cb = undefined,
  }) {
    const fn = async data => {
      if (!idfield) idfield = this._idfield;
      const _filter = filter || {
        ...(!!data.query[idfield] && {
          [idfield]: data.query[idfield] ?? data.body[idfield],
          ...(Object.keys(this._model.schema.paths).includes('active') &&
            filterActive && { active: true }),
        }),
      };
      return await this._model.find(_filter).exec();
    };
    return await this._fragment(fn, returnMiddleware, data, pre_cb, post_cb);
  }

  async update({
    idfield = undefined,
    filter = undefined,
    returnMiddleware = undefined,
    data = undefined,
    pre_cb = undefined,
    post_cb = undefined,
    upsert = false,
  }) {
    const fn = async data => {
      if (!idfield) idfield = this._idfield;
      const _filter = filter || {
        ...(!!data.query[idfield] && {
          [idfield]: data.query[idfield] ?? data.body[idfield],
        }),
      };
      this._schema && this._schema.validate(data.body);
      const { createdAt, __v, createdBy, updatedBy, meta, ...rest } = data.body;
      return await this._model.updateMany(_filter, rest, { upsert: upsert }).exec();
    };
    return await this._fragment(fn, returnMiddleware, data, pre_cb, post_cb);
  }

  async remove({
    idfield = undefined,
    filter = undefined,
    returnMiddleware = undefined,
    data = undefined,
    pre_cb = undefined,
    post_cb = undefined,
  }) {
    const fn = async data => {
      if (!idfield) idfield = this._idfield;
      const _filter = filter || {
        ...(!!data.query[idfield] && {
          [idfield]: data.query[idfield] ?? data.body[idfield],
        }),
      };
      return await this._model.deleteMany(_filter).exec();
    };
    return await this._fragment(fn, returnMiddleware, data, pre_cb, post_cb);
  }
}
