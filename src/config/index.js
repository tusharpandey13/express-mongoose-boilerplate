import configJSON from './config.json';

const getConfig = key => {
  try {
    return process.env[key] ?? configJSON[process.env.NODE_ENV][key] ?? configJSON['common'][key];
  } catch (err) {
    return undefined;
  }
};

// exports your config vars here
// these will be pulled from .env AND config.json

export const MONGODB_URI = getConfig('MONGODB_URI');
export const JWT_SECRET = getConfig('JWT_SECRET');
export const SESSION_SECRET = getConfig('SESSION_SECRET');
export const PORT = getConfig('PORT');
export const LOG_LEVEL = getConfig('LOG_LEVEL');
export const PRETTY_LOGS = getConfig('PRETTY_LOGS');
export const REDIS_HOST = getConfig('REDIS_HOST');
export const REDIS_PORT = getConfig('REDIS_PORT');
export const GOOGLE_CLIENT_ID = getConfig('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = getConfig('GOOGLE_CLIENT_SECRET');
