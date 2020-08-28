import Joi from '@hapi/joi';

export const validation = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).max(128).required(),
  name: Joi.string().max(128).required(),
  role: Joi.string().max(128).required().default('user'),
  details: Joi.object(),
});

export const googleValidation = Joi.object().keys({
  email: Joi.string().email(),
  password: Joi.string().min(4).max(128),
  name: Joi.string().max(128),
  role: Joi.string().max(128).required().default('user'),
  details: Joi.object(),
});
