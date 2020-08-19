import { clearConsoleAndScrollbackBuffer } from '~/utils';
import mongooseLoader from '~/loaders/mongoose';
// import { PORT } from '~/config';

const loader = async application => {
  clearConsoleAndScrollbackBuffer();

  const mongooseDb = await mongooseLoader();
  // console.log('grgr', PORT);

  // await expressLoader(application, mongooseDb);
};

export default loader;
