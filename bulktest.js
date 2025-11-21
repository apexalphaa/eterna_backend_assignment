const WebSocket = require("ws");

const URL = "ws://localhost:3000/api/orders/execute";

// Number of orders to send
const TOTAL_ORDERS = 10;

function sendOrder(i) {
    const ws = new WebSocket(URL);

    ws.on("open", () => {
        console.log(`🔵 Sending Order #${i + 1}`);
        ws.send(JSON.stringify({
            orderType: "market",
            tokenIn: "SOL",
            tokenOut: "USDC",
            amount: Math.floor(Math.random() * 1000000) + 1000
        }));
    });

    ws.on("message", msg => {
        console.log(`🟢 Order #${i + 1} update:`, msg.toString());
    });

    ws.on("close", () => {
        console.log(`🔴 WebSocket closed for Order #${i + 1}`);
    });
}

// fire 10 WebSockets simultaneously
for (let i = 0; i < TOTAL_ORDERS; i++) {
    sendOrder(i);
}
