import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import config from './config';

const createApp = (): Application => {
  const app = express();

  // --------------- Middleware ---------------
  app.use(helmet());
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
  
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
  }));
  // No endpoint accepts large payloads; keep the limit tight to reduce the
  // impact of oversized-body requests.
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // --------------- Routes ---------------
  app.use('/api', routes);

  // --------------- Error Handling ---------------
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
