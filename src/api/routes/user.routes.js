import totoro from 'totoro-node';
import loggerFactory from '~/utils/logger';

export default totoro.rain(
  {
    abcd: {
      endpoints: [
        {
          route: '/user/register',
          method: 'GET',
          middleware: [],
          implementation: async (apiversion, req, res, next) => {
            res.send('feife');
          },
        },
      ],
    },
  },
  loggerFactory({ colorizeMessage: false }),
  true
);
