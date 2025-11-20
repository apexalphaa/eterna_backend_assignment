
import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import ordersController from './api/orders.controller';

export default async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(websocket);

  ordersController(app);

  return app;
}
