import Redis from "ioredis";
import { redisHost, redisPort } from "./config";

// Initialize your Redis client
const redisClient = new Redis({
  host: redisHost || "redis",
  port: redisPort || 6379,
  // Your Redis config options (host, port, etc.)
});

// Event listener for successful connection
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

// Event listener for errors
redisClient.on("error", (err) => {
  console.error("Redis error", err);
});

export default redisClient;
