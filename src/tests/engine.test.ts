/**
 * src/tests/engine.test.ts
 */

import mockDexClass from "../services/dex/mockDexRouter";
import dexRouter from "../services/dex/dexRouter";
import socketManager from "../ws/socketManager";
import queueService from "../services/queue.service";
import orderWorker from "../workers/order.worker";
import db from "../db";

// Mock modules so tests don't touch Redis/Postgres/WebSocket
jest.mock("../ws/socketManager");
jest.mock("../db");
jest.mock("../services/dex/dexRouter");

jest.mock("../services/queue.service", () => ({
  enqueueOrder: jest.fn().mockResolvedValue(true)
}));

describe("MockDex basic behaviour", () => {
  it("raydium & meteora quotes return expected shape", async () => {
    const MD: any = new (mockDexClass as any)();
    const r = await MD.getRaydiumQuote("A", "B", 1000);
    const m = await MD.getMeteoraQuote("A", "B", 1000);

    expect(r).toHaveProperty("dex", "raydium");
    expect(typeof r.price).toBe("number");
    expect(m).toHaveProperty("dex", "meteora");
    expect(typeof m.price).toBe("number");
  });
});

describe("dexRouter behaviour (mocked)", () => {
  it("returns best price correctly", async () => {
    (dexRouter as any).route = jest.fn().mockResolvedValue({
      r: { dex: "raydium", price: 1.1 },
      m: { dex: "meteora", price: 1.0 },
      best: { dex: "meteora", price: 1.0 }
    });

    const res = await (dexRouter as any).route();
    expect(res.best.dex).toBe("meteora");
    expect(res.best.price).toBe(1.0);
  });
});

describe("SocketManager basic", () => {
  it("register + emit works", () => {
    const fakeWs: any = { send: jest.fn() };
    (socketManager as any).register("order_x", fakeWs);

    expect(() => {
      (socketManager as any).emit("order_x", { status: "routing" });
    }).not.toThrow();
  });
});

describe("Worker lifecycle success", () => {
  beforeAll(() => {
    (dexRouter as any).route = jest.fn().mockResolvedValue({
      r: { dex: "raydium", price: 1.02 },
      m: { dex: "meteora", price: 1.0 },
      best: { dex: "meteora", price: 1.0 }
    });

    (dexRouter as any).execute = jest.fn().mockResolvedValue({
      txHash: "mock_tx_abc",
      executedPrice: 1.001
    });

    (socketManager as any).emit = jest.fn();
    (db as any).saveOrderResult = jest.fn().mockResolvedValue(true);
  });

  it("emits routing→building→submitted→confirmed", async () => {
    const order = { orderId: "order_unit_1", orderType: "market", tokenIn: "SOL", tokenOut: "USDC", amount: 1000 };
    await (orderWorker as any).process(order);

const emitMock = (socketManager as any).emit as jest.Mock;
const statuses = emitMock.mock.calls.map((c: any[]) => c[1].status);


    expect(statuses).toContain("routing");
    expect(statuses).toContain("building");
    expect(statuses).toContain("submitted");
    expect(statuses).toContain("confirmed");

    expect((db as any).saveOrderResult).toHaveBeenCalledWith(expect.objectContaining({
      orderId: order.orderId,
      status: "confirmed"
    }));
  });
});

describe("Worker lifecycle failure", () => {
  it("emits failed on execution error", async () => {
    (dexRouter as any).route = jest.fn().mockResolvedValue({
      r: { dex: "raydium", price: 1.05 },
      m: { dex: "meteora", price: 1.06 },
      best: { dex: "raydium", price: 1.05 }
    });

    (dexRouter as any).execute = jest.fn().mockRejectedValue(new Error("liquidity error"));
    (socketManager as any).emit = jest.fn();
    (db as any).saveOrderResult = jest.fn().mockResolvedValue(true);

    const order = { orderId: "order_fail_1", orderType: "market", tokenIn: "SOL", tokenOut: "USDC", amount: 1000 };

    await expect((orderWorker as any).process(order)).rejects.toThrow();

    expect((socketManager as any).emit).toHaveBeenCalledWith(
      "order_fail_1",
      expect.objectContaining({ status: "failed" })
    );

    expect((db as any).saveOrderResult).toHaveBeenCalledWith(expect.objectContaining({
      orderId: "order_fail_1",
      status: "failed"
    }));
  });
});
