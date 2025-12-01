import "dotenv/config";
import redis from "ioredis";
import { log } from "../../../../packages/utils/winstonLogger";

const redisClient = new redis(process.env.REDIS_URL!);
redisClient.on("connect", () => {
    log.info("Connected to Redis");
});
redisClient.on("error", (err) => {
    log.error(`Redis connection error:\n ${err}`);
});

export { redisClient };