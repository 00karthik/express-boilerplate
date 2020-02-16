import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { json, urlencoded, text } from 'body-parser';
import expressValidator from 'express-validator';
import env from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import errorMidlleware from './src/middlewares/error.middleware';
import router from './src/routes';
import winston from './src/config/winston';
// Load environment variables from .env file
env.load();

const app = express();
app.set('trust proxy', 1);
const apiLimiter = rateLimit({
  windowMs: 0.5 * 60 * 1000, // 30 seconds
  max: 50,
  handler: (req, res) => {
    winston.warn(`Too many requests from ${req.ip}`);
    if ((Math.log(req.rateLimit.current - 1) / Math.log(30)) % 1 === 0) {
      EmailService.sendRateLimitMail(req);
    }
    res.status(429).send('Too many requests. Try again later');
  }
});

const port = process.env.PORT || 3000;
app.set('port', port);
app.use(apiLimiter);
app.use(compression());
app.use(json({ limit: '50mb' }));
app.use(urlencoded({ extended: true, limit: '50mb' }));
app.use(text({ limit: '50mb' }));
app.use(expressValidator());
app.use(cookieParser());
app.use(cors());

app.use(authMiddleware);
app.use(router);

app.use(
  morgan('combined', {
    stream: winston.stream,
    skip: req => {
      if (req.url === 'forms/questions/:id') {
        return true;
      }
      return false;
    }
  })
);

mongoose.connect(process.env.MONGODB, { poolSize: 20 });
mongoose.connection.on('error', () => {
  console.log(
    'MongoDB Connection Error. Please make sure that MongoDB is running.'
  );
  process.exit(1);
});

app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`);
});
app.use(errorMidlleware);
export default app;
