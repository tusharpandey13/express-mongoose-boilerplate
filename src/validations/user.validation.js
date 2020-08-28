import Joi from '@hapi/joi';

export default Joi.object().keys({
  email: Joi.string().min(10).max(15).required(),
  password: Joi.string().min(4).max(128).required(),
  name: Joi.string().max(128).required(),
  role: Joi.string().max(128).required().default('customer'),
  details: Joi.object(),
});
