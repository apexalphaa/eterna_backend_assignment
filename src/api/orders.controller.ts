import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import queue from "../services/queue.service";
import socketManager from "../ws/socketManager";

// Import Fastify WebSocket types to fix TS errors
import { RawData, WebSocket } from "ws";

export default function ordersController(app: FastifyInstance) {
  
  app.get(
    "/api/orders/execute",
    { websocket: true },
    (connection, req) => {
      const ws: WebSocket = connection.socket;

      console.log("Client connected to WebSocket");

      ws.on("message", async (msg: RawData) => {

        try {
          const data = JSON.parse(msg.toString());
          const { orderType, tokenIn, tokenOut, amount } = data;

          // Validate
          if (!orderType || !tokenIn || !tokenOut || !amount) {
            ws.send(JSON.stringify({
              status: "failed",
              error: "Invalid payload. Required: orderType, tokenIn, tokenOut, amount"
            }));
            return;
          }

          // Generate ID
          const orderId = "order_" + uuidv4();

          // Register websocket for live updates
          socketManager.register(orderId, ws);

          // Notify pending state
          ws.send(JSON.stringify({ orderId, status: "pending" }));

          // Push into queue
          await queue.enqueueOrder({ orderId, ...data });

        } catch (err) {
          ws.send(JSON.stringify({
            status: "failed",
            error: "Invalid JSON message"
          }));
        }

      });

    }
  );

}
