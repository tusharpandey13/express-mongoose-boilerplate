import userRoutes from '~/api/routes/user.routes';
import adminRoutes from '~/api/routes/admin.routes';

export default async (app, db) => {
  await userRoutes(app);
  await adminRoutes(app);
};
