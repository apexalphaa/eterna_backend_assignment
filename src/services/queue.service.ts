
import { Queue, Worker, QueueScheduler } from "bullmq";
import IORedis from "ioredis";
import config from "../config";
import workerFn from "../workers/order.worker";

const connection = new IORedis(config.redisUrl);
const queueName = "orders";

const queue = new Queue(queueName, { connection });
new QueueScheduler(queueName, { connection });

new Worker(queueName, async job => workerFn(job.data), {
  connection,
  concurrency: config.maxConcurrency
});

export default {
  enqueueOrder(order: any) {
    return queue.add(order.orderId, order, {
      attempts: config.maxRetries,
      backoff: { type: "exponential", delay: 1000 }
    });
  }
};
