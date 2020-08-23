import userRouter from '~/api/routes/user.routes';

export default async (app, db) => {
  await app.use('/api', userRouter);
};
