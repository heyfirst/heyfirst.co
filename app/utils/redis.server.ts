import Redis from "ioredis";

const redis = new Redis({
  port: Number(process.env.REDIS_PORT) || 6379,
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  password: process.env.REDIS_PASSWORD ?? "",
  family: 6,
});

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;

export const setJSON = async (key: string, value: Record<string, any>) => {
  await redis.set(key, JSON.stringify(value));
  await redis.expire(key, SEVEN_DAYS_IN_SECONDS);
};

export const getJSON = async (key: string) => {
  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  return JSON.parse(data);
};

export const flush = async () => {
  await redis.flushall();
};
