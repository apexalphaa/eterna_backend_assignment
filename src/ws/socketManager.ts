
import { WebSocket } from "ws";

class SocketManager {
  private sockets = new Map<string, WebSocket>();

  register(orderId: string, ws: WebSocket) {
    this.sockets.set(orderId, ws);
    ws.on("close", () => this.sockets.delete(orderId));
  }

  emit(orderId: string, data: any) {
    const ws = this.sockets.get(orderId);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }
}

export default new SocketManager();
