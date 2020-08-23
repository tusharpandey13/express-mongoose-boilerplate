import totoro from 'totoro-node';
// import crudControllerClass from '~/api/controllers/crud';
// import model from '~/models/user';
// import schema from '~/validations/user.validation';

// const crud = new crudControllerClass({
//   model: model,
//   schema: schema,
// });

export default totoro.rain({
  v1: {
    endpoints: [
      {
        route: '/user/register',
        method: 'GET',
        middleware: [],
        implementation: async (apiversion, req, res, next) => {
          try {
            req.send(1);
          } catch (err) {
            next(err);
          }
        },
      },
      // {
      //   route: '/another/test/endpoint',
      //   method: 'POST',
      //   implementation: anotherImplementationFunction,
      // },
    ],
  },
});
