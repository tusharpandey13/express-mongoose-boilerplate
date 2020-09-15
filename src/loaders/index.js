import { clearConsoleAndScrollbackBuffer } from '~/utils';
import mongooseLoader from '~/loaders/mongoose';
import expressLoader from '~/loaders/express';
import passportLoader from '~/loaders/passport';
import sessionLoader from '~/loaders/session';
import serverLoader from '~/loaders/server';

const loader = async application => {
  // if not in prod, clear console before starting
  if (process.env['NODE_ENV'] !== 'production') clearConsoleAndScrollbackBuffer();

  // load mongoose
  const db = await mongooseLoader();

  // load passport
  const passport = await passportLoader();

  // load session
  const session = await sessionLoader();

  // load express
  await expressLoader(application, db, passport, session);

  // load server
  await serverLoader(application);
};

export default loader;
