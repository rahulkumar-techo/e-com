/* Reverse proxy setup for API Gateway */

import { createProxyMiddleware } from 'http-proxy-middleware';
import { Express } from 'express';

export function setupProxy(app: Express) {
  // Auth Service Proxy
  app.use(
    '/auth',
    createProxyMiddleware({
      target: 'http://localhost:5001', // auth-service port
      changeOrigin: true,
      pathRewrite: { '^/auth': '' },
    })
  );

  // Product Service Proxy
  app.use(
    '/product',
    createProxyMiddleware({
      target: 'http://localhost:5002', // product-service port
      changeOrigin: true,
      pathRewrite: { '^/product': '' },
    })
  );

  // Order Service Proxy
  app.use(
    '/order',
    createProxyMiddleware({
      target: 'http://localhost:5003',
      changeOrigin: true,
      pathRewrite: { '^/order': '' },
    })
  );
}
