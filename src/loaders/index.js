import { clearConsoleAndScrollbackBuffer } from '~/utils';
import mongooseLoader from '~/loaders/mongoose';
import expressLoader from '~/loaders/express';
import passportLoader from '~/loaders/passport';
import sessionLoader from '~/loaders/session';

const loader = async application => {
  if (process.env['NODE_ENV'] !== 'production') clearConsoleAndScrollbackBuffer();

  const db = await mongooseLoader();
  const passport = await passportLoader();
  const session = await sessionLoader();

  await expressLoader(application, db, passport, session);
};

export default loader;
