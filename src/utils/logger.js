import winston from 'winston';
import colors from 'colors';
import { LOG_LEVEL, PRETTY_LOGS } from '~/config';

const { createLogger, format, transports } = winston;

const printfFormat = info => {
  if (info.message === '\n') return info.message;
  // console.log(info);
  const errstr = info.stack
    ? `\n${info.stack}\n    Path    :  ${info.method}  ${info.path}\n    UA      :  ${info.UA}\n    Origin  :  ${info.origin}\n\n`
    : '';
  return `[${colors.gray(info.timestamp)}] [${info.level}]    ${info.message}${errstr}`;
};

const baseFormat = format.combine(
  format.timestamp({
    format: () => {
      return Date.now();
    },
  }),
  format.errors({ stack: true }),
  format.printf(printfFormat)
);

const splunkFormat = format.combine(baseFormat, format.json());
const prettyFormat = format.combine(
  format.colorize({ level: PRETTY_LOGS, message: true }),
  baseFormat
  // format.prettyPrint({ colorize: true })
);

export default createLogger({
  level: LOG_LEVEL,
  format: PRETTY_LOGS ? prettyFormat : splunkFormat,
  // defaultMeta: { module: path.basename(moduleName) },
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'logfile.log' }),
  ],
});
