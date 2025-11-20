#  Eterna Backend Assignment — Order Execution Engine

This project implements a **Market Order Execution Engine** with:

- Fastify API  
- WebSocket live order status updates  
- DEX routing (Raydium vs Meteora — mock implementation)  
- Queue-based order processing (BullMQ + Redis)  
- Worker lifecycle (pending → routing → building → submitted → confirmed)  
- Postman WebSocket collection  
- Jest test suite  

 Designed according to assignment requirements  
 Clean code architecture  
 Real-time streaming using WebSockets  
 Mock DEX router with price variation  
 Safe for extension into a real devnet execution engine  

---

#  Features

### WebSocket Order Execution  
A single WebSocket connection handles:
- Order submission  
- Live status updates  
- Final confirmation response  

### DEX Router (Mock)  
Gets quotes from:
- Raydium
- Meteora

Selects the **best price** and routes execution accordingly.

### Worker + Queue  
Uses:
- Redis
- BullMQ worker  
- Exponential retry (up to 3 attempts)

Manages **multiple concurrent orders**.

### Execution Lifecycle  
Each order emits:
pending
routing
building
submitted
confirmed

### Project Structure
src/
api/
orders.controller.ts
services/
dex/
dexRouter.ts
mockDexRouter.ts
queue.service.ts
workers/
order.worker.ts
ws/
socketManager.ts
utils/
sleep.ts
server.ts
tests/
engine.test.ts

### How to Run Locally

1. Start Redis
docker-compose up -d

2. Install dependencies
npm install

3. Start API + WS server
npm run dev

4. Start worker
npm run worker

# Deployment

### Backend Live URL
https://eternabackendassignment-production.up.railway.app

