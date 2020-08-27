import userRoutes from '~/api/routes/user.routes';

export default async (app, db) => {
  await userRoutes(app);
};
