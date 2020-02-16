import winston from '../config/winston';

const errorMidlleware = (err, req) => {
  winston.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );
};

export default errorMidlleware;
