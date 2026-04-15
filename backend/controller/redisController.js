const asyncHandler = require("express-async-handler");
const db = require("../db/models");
const redisClient = require("../config/redis");


const updateRoleDegree = asyncHandler(async (req, res) => {
  const { Eva_Id, userRole, degreeCode } = req.body;
  console.log('========== REDIS UPDATE REQUEST ==========');
  console.log('Received request to update role and degree');
  console.log('Eva_Id:', Eva_Id);
  console.log('userRole:', userRole);
  console.log('degreeCode:', degreeCode);
  console.log('Redis connected:', redisClient.isConnected());
  console.log('==========================================');
  
  // Validate required fields
  if (!Eva_Id) {
    console.error('ERROR: Eva_Id is missing from request');
    return res.status(400).json({ message: "Eva_Id is required" });
  }

  // Check if Redis is available
  if (!redisClient.isConnected()) {
    console.warn('⚠ WARNING: Redis not available. Data not cached.');
    return res.status(200).json({ 
      message: "Request received but Redis caching unavailable",
      warning: "Redis server is not running",
      data: { Eva_Id, userRole, degreeCode }
    });
  }

  try {
    // Create a unique key for this user
    const redisKey = `user:${Eva_Id}`;
    
    // Prepare data object
    const userData = {
      Eva_Id,
      ...(userRole !== undefined && { userRole: String(userRole) }),
      ...(degreeCode !== undefined && { degreeCode: String(degreeCode) }),
      updatedAt: new Date().toISOString()
    };

    console.log('Storing in Redis with key:', redisKey);
    console.log('Data to store:', userData);

    // Store in Redis as a hash (this will overwrite existing values)
    const result = await redisClient.hSet(redisKey, userData);
    console.log('Redis hSet result:', result);
    
    // Verify it was stored
    const verification = await redisClient.hGetAll(redisKey);
    console.log('Verification read from Redis:', verification);
    
    // Optional: Set expiration (e.g., 24 hours)
    // await redisClient.expire(redisKey, 86400);
    
    console.log(`✓ Successfully stored data in Redis for Eva_Id: ${Eva_Id}`);
    
    res.status(200).json({ 
      message: "User role and degree updated successfully in Redis",
      data: userData
    });
  } catch (error) {
    console.error('❌ Redis error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: "Failed to update user data in Redis",
      error: error.message 
    });
  }
});

module.exports = {
  updateRoleDegree
};