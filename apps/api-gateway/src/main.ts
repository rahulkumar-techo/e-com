/* Express server entry for API Gateway */

import express from 'express';
import { setupProxy } from './proxy.config';
import { ResponseHandler } from '../../../packages/utils';
import { errorMiddleware } from '../../../packages/middlewares/errorMiddleware';
import cors from 'cors';
import { globalRateLimit } from './middlewares/rateLimit.global';
const app = express();


// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(globalRateLimit);

// Sample Health Check Route
app.get('/health', (req, res) => {
  ResponseHandler.success(res, { status: 'API Gateway is healthy' });
});

app.use(errorMiddleware);

// Reverse Proxy
setupProxy(app);

app.listen(5000, () => {
  console.log('API Gateway running on http://localhost:5000 🚀');
});
