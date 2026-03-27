import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import healthRoutes from './routes/health.routes';
import emailRoutes from './routes/email.routes';
import webhookRoutes from './routes/webhook.routes';

const app = express();

// Webhook route must use raw body for signature verification — mount BEFORE json()
app.use('/api/webhooks', webhookRoutes);

// All other routes use JSON body
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.use('/api/health', healthRoutes);
app.use('/api/emails', emailRoutes);

app.use(errorHandler);

export default app;
