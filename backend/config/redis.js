const redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

// Create Redis client
const createRedisClient = () => {
  const client = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.log('Redis: Max reconnection attempts reached. Running without Redis.');
          return false; // Stop reconnecting
        }
        return Math.min(retries * 100, 3000);
      }
    },
    password: process.env.REDIS_PASSWORD || undefined
  });

  // Handle connection events
  client.on('connect', () => {
    console.log('✓ Redis client connected');
    isRedisConnected = true;
  });

  client.on('ready', () => {
    console.log('✓ Redis client ready');
    isRedisConnected = true;
  });

  client.on('error', (err) => {
    isRedisConnected = false;
    if (err.code === 'ECONNREFUSED') {
      console.warn('⚠ Redis server not running. Application will continue without Redis caching.');
    } else {
      console.error('Redis client error:', err.message);
    }
  });

  client.on('end', () => {
    console.log('Redis client disconnected');
    isRedisConnected = false;
  });

  return client;
};

// Initialize Redis connection
(async () => {
  try {
    redisClient = createRedisClient();
    await redisClient.connect();
  } catch (err) {
    console.warn('⚠ Failed to connect to Redis. Application will continue without Redis.');
    console.log('To install Redis on macOS: brew install redis && brew services start redis');
    isRedisConnected = false;
  }
})();

// Export a safe wrapper
module.exports = {
  isConnected: () => isRedisConnected,
  getClient: () => redisClient,
  
  // Safe operations that handle disconnected state
  async hSet(key, data) {
    if (!isRedisConnected || !redisClient) {
      console.warn('Redis not connected. Skipping cache operation.');
      return null;
    }
    try {
      // Convert object to array format for Redis hSet
      if (typeof data === 'object' && !Array.isArray(data)) {
        const pairs = Object.entries(data).flat();
        return await redisClient.hSet(key, pairs);
      }
      return await redisClient.hSet(key, data);
    } catch (err) {
      console.error('Redis hSet error:', err.message);
      return null;
    }
  },
  
  async hGetAll(key) {
    if (!isRedisConnected || !redisClient) {
      console.warn('Redis not connected. Skipping cache retrieval.');
      return null;
    }
    try {
      return await redisClient.hGetAll(key);
    } catch (err) {
      console.error('Redis hGetAll error:', err.message);
      return null;
    }
  },
  
  async del(key) {
    if (!isRedisConnected || !redisClient) {
      return null;
    }
    try {
      return await redisClient.del(key);
    } catch (err) {
      console.error('Redis del error:', err.message);
      return null;
    }
  },
  
  async expire(key, seconds) {
    if (!isRedisConnected || !redisClient) {
      return null;
    }
    try {
      return await redisClient.expire(key, seconds);
    } catch (err) {
      console.error('Redis expire error:', err.message);
      return null;
    }
  }
};
