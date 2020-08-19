import mongooseLoader from '~/loaders/mongoose';
import expressLoader from '~/loaders/express';
import { clearConsoleAndScrollbackBuffer } from '~/utils';
// import { PORT } from '~/config';

const loader = async application => {
  clearConsoleAndScrollbackBuffer();

  const mongooseDb = await mongooseLoader();
  // console.log('grgr', PORT);

  await expressLoader(application, mongooseDb);
};

export default loader;
