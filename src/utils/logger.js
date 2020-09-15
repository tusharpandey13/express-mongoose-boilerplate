import winston from 'winston';
import colors from 'colors';
import { LOG_LEVEL, PRETTY_LOGS } from '~/config';

const { createLogger, format } = winston;

export default ({ colorizeMessage = true }) => {
  const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'cyan',
    verbose: 'white',
    debug: 'blue',
    silly: 'white',
  };

  const printfFormat = info => {
    if (info.message === '\x1B[36m\x1B[39m\n\x1B[36m\x1B[39m' || info.message === '\n') {
      return info.message;
    }

    var errstr = '';
    if (info.stack) {
      const stackstr = info.stack
        .split('\n')
        .map((e, i) => {
          // if (!i) return '';
          e = e.trim();
          if (e.includes('/node_modules/')) {
            if (info.level === 'error') {
              e = `${colors.grey(e)}\n`;
            } else return '';
          } else e = `${e}\n`;
          if (e.includes('file')) {
            let tmp = e.match(/\(([^)]+)\)/g);
            if (tmp) {
              tmp = tmp[0].slice(1, -1);
              e = e.replace(tmp, colors.cyan(tmp));
            }
          }
          return `  ${e}`;
        })
        .join('');
      errstr = stackstr + [`    UA      :  ${info.UA}`, `Origin  :  ${info.origin}\n\n`].join('\n    ');
    }

    const prelf = ['error', 'warn'].includes(info.level) ? '\n' : '';
    const colorizer = colors[logColors[info.level]];

    const timestr = colors.gray(info.timestamp);
    const levelstr = colorizer(info.level);
    const msgstr = colorizer(info.message);

    return `${prelf}[${timestr}] [${levelstr}]    ${msgstr}${errstr}`;
  };

  const baseFormat = format.combine(
    format.timestamp({
      format: () => {
        return Date.now();
      },
    }),
    format.errors({ stack: true })
  );

  const splunkFormat = format.combine(baseFormat, format.prettyPrint({ colorize: false }));

  winston.addColors(logColors);
  const prettyFormat = format.combine(
    // format.colorize({ level: PRETTY_LOGS, message: colorizeMessage }),
    baseFormat,
    format.printf(printfFormat)
  );

  return createLogger({
    level: LOG_LEVEL,
    format: PRETTY_LOGS ? prettyFormat : splunkFormat,
    // defaultMeta: { module: path.basename(moduleName) },
    transports: [
      new winston.transports.Console(),
      // new winston.transports.File({ filename: 'logfile.log' }),
    ],
  });
};
