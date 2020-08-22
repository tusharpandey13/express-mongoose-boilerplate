import { rain } from 'totoro-node';

export default rain({
  v1: {
    endpoints: [
      {
        route: '/user/register',
        method: 'POST',
        middleware: [],
        implementation: originalImplementationFunction,
      },
      // {
      //   route: '/another/test/endpoint',
      //   method: 'POST',
      //   implementation: anotherImplementationFunction,
      // },
    ],
  },
});
