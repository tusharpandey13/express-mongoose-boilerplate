import { MONGODB_URI } from '~/config';

import mongoose from 'mongoose';
import bluebird from 'bluebird';
import fs from 'fs';

mongoose.Promise = bluebird;

export default async () => {
  // Connect to MongoDB
  const connection = await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });

  const __dirname = fs.realpathSync('.');
  const modelDir = __dirname + '/src/models';
  fs.readdirSync(modelDir).forEach(async file => {
    if (~file.indexOf('.js')) await import(modelDir + '/' + file);
  });

  console.log('✌️ DB loaded and connected!');
  // returns promise
  return connection.connection.db;
};
