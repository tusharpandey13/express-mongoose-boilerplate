import userRoutes from '~/api/routes/user.routes';
import adminRoutes from '~/api/routes/admin.routes';

export default async (app, db) => {
  await userRoutes(app);
  await adminRoutes(app);

  // test
  app.get('/ping', (req, res) => {
    res.status(200).send('hi!!');
  });

  // endpoint to clear DB and session cache. Enable with care!!!
  //
  // app.get('/cleardb', async (req, res) => {
  //   try {
  //     await db.dropDatabase(console.log(`${db.databaseName} database dropped.`));
  //     session.redisClient.flushdb(function (err, succeeded) {
  //       console.log(succeeded); // will be true if successfull
  //       console.log(err);
  //     });
  //     res.send('Ok');
  //   } catch (err) {
  //     res.send(err);
  //   }
  // });
};
