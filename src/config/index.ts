
import dotenv from 'dotenv';
dotenv.config();

export default {
  port: Number(process.env.PORT || 3000),
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  databaseUrl: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/orders",
  maxConcurrency: 10,
  maxRetries: 3
};
