import configJSON from './config.json';

const getConfig = key => {
  try {
    return (
      (process.env.NODE_ENV === 'production' && process.env[key]) ||
      (configJSON[process.env.NODE_ENV][key] ?? configJSON['common'][key])
    );
  } catch (err) {
    return undefined;
  }
};

export const MONGODB_URI = getConfig('MONGODB_URI');
export const JWT_SECRET = getConfig('JWT_SECRET');
export const SESSION_SECRET = getConfig('SESSION_SECRET');
export const PORT = getConfig('PORT');
export const LOG_LEVEL = getConfig('LOG_LEVEL');
export const PRETTY_LOGS = getConfig('PRETTY_LOGS');
