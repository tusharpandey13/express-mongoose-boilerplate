import mongooseLoader from '~/loaders/mongoose';
import expressLoader from '~/loaders/express';
import { clearConsoleAndScrollbackBuffer } from '~/utils';

const loader = async application => {
  // if (process.env['NODE_ENV'] !== 'production') clearConsoleAndScrollbackBuffer();

  const mongooseDb = await mongooseLoader();

  await expressLoader(application, mongooseDb);
};

export default loader;
