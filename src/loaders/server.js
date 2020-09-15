import { normalizePort } from '~/utils';
import { PORT } from '~/config';

export default async app => {
  await app.set('PORT', normalizePort(PORT));

  // Create HTTP server object to respond to events.
  var server = app.listen(PORT);

  // // Respond to error event.
  server.on('error', onError);
  __logger.log('info', `✌️ Server started on port ${PORT}\t\n\n`);

  // // Catch unhandled rejections
  process.on('unhandledRejection', err => {
    console.error('Unhandled rejection', err);
    //   // logger.error('Unhandled rejection', err);
    process.exit(1);
  });

  // // Catch uncaught exceptions
  process.on('uncaughtException', err => {
    console.error('Uncaught exception', err);
    process.exit(1);
  });

  // // Event listener for HTTP server "error" event.
  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    // // handle specific listen errors with friendly messages

    if (error.code === 'EACCES') {
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    } else if (error.code === 'EADDRINUSE') {
      console.error(bind + ' is already in use');
      process.exit(1);
    } else {
      throw error;
    }
  }
};
