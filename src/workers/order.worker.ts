
import router from '../services/dex/dexRouter';
import socket from '../ws/socketManager';

export default async function(order: any) {
  const id = order.orderId;

  socket.emit(id, { orderId: id, status: "routing" });
  const quotes = await router.route();

  socket.emit(id, { orderId: id, status: "routing", meta: quotes });

  socket.emit(id, { orderId: id, status: "building" });

  socket.emit(id, { orderId: id, status: "submitted", dex: quotes.best.dex });

  const exec = await router.execute(quotes.best.dex, quotes.best.price);

  socket.emit(id, { orderId: id, status: "confirmed", ...exec });

  return exec;
}
