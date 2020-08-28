import session from 'express-session';
import { v4 as uuid } from 'uuid';
import redis from 'redis';
import connectRedis from 'connect-redis';

import { SESSION_SECRET, REDIS_HOST, REDIS_PORT } from '~/config';

export default () => {
  const redisStore = connectRedis(session);
  const redisClient = redis.createClient();
  redisClient.on('error', err => {
    console.log('Redis error: ', err);
  });

  const redisStoreInstance = new redisStore({ host: REDIS_HOST, port: REDIS_PORT, client: redisClient });

  return {
    redisStoreInstance: redisStoreInstance,
    redisClient: redisClient,
    session: session({
      secret: SESSION_SECRET, // session secret
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
      genid: req => uuid(),
      store: redisStoreInstance,
      name: '_redisStore',
    }),
  };
};
