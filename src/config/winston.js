import Winston from 'winston';

const options = {
  file: {
    level: 'info',
    filename: 'logs/app.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: true
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

const logger = new Winston.createLogger({
  transports: [
    new Winston.transports.File(options.file),
    new Winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new Winston.transports.File({
      filename: 'logs/warnings.log',
      level: 'warn'
    }),
    new Winston.transports.Console(options.console)
  ],
  exitOnError: false // do not exit on handled exceptions
});
logger.stream = {
  write: message => {
    logger.info(message);
  }
};

export default logger;
