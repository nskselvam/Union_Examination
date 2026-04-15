const jwt = require("jsonwebtoken");
const db = require("../db/models");
const redisClient = require("../config/redis");
const user = db.faculties;
const NavData = db.navbar_header;
const asyncHandler = require("express-async-handler");
const AppError = require("../utils/appError");


const modalprotect = asyncHandler(async (req, res, next) => {
  console.log(req.cookies);
  console.log('Request headers:', req.query); // Debug log to check incoming headers

  let token;
  
  // Check for token in cookies first, then query params (for file downloads)
  token = req.cookies.jwt || req.query.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const tokendb = await user.findByPk(decoded.userId);
      if (!tokendb) {
        return next(new AppError("User not found", 401));
      }
      if (tokendb.token_version !== decoded.token_version) {
        return next(new AppError("User not found", 401));
      }

      req.user = tokendb;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401);
      throw new AppError(`Not authorised, token failed: ${error.message}`);
    }
  } else {
    res.status(401);
    throw new AppError("Not authorised, no token");
  }
});

const protect = asyncHandler(async (req, res, next) => {
  console.log(req.cookies);
  console.log('Request headers:', req.query); // Debug log to check incoming headers


  
  // Extract route path from custom header or referer
  let routePath = req.headers['x-current-route'] || req.headers['current-route'];
  
  if (!routePath) {
    const referer = req.headers.referer || req.headers.referrer;
    console.log('Referer Header:', referer);
    
    if (referer) {
      try {
        const url = new URL(referer);
        routePath = url.pathname.substring(1); // Remove leading slash
      } catch (error) {
        console.log('Error parsing referer:', error.message);
      }
    }
  }
  
  console.log('Route Path:', routePath);
  req.routePath = routePath;
  
  let token;
  
  // Check for token in cookies first, then query params (for file downloads)
  token = req.cookies.jwt || req.query.token;
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const tokendb = await user.findByPk(decoded.userId);
      if (!tokendb) {
        return next(new AppError("User not found", 401));
      }
      if (tokendb.token_version !== decoded.token_version) {
        return next(new AppError("User not found", 401));
      }

      // Retrieve user data from Redis using decoded userId as Eva_Id
      let redisUserData = null;
      if (redisClient.isConnected()) {
        try {
          const redisKey = `user:${tokendb.Eva_Id}`;
          redisUserData = await redisClient.hGetAll(redisKey);
          
          if (redisUserData && Object.keys(redisUserData).length > 0) {
            console.log('Retrieved Redis data for Eva_Id:', tokendb.Eva_Id, redisUserData);
            
            // Attach Redis data to request object for use in routes
            req.redisUserData = redisUserData;
          } else {
            console.log('No Redis data found for Eva_Id:', tokendb.Eva_Id);
          }
        } catch (redisError) {
          console.error('Error retrieving Redis data:', redisError);
          // Continue without Redis data - don't fail the request
        }
      }

      // Use userRole from Redis if available, otherwise fall back to query parameter
      const userRole = redisUserData?.userRole || req.query.userRole;
let flnameRollMaster = "User_Roll_Admin_" + userRole;
console.log('Constructed field name for role:', flnameRollMaster);

// Skip navigation check for dashboard routes and valuation for userRole 2
if (!((routePath === 'admin/dashboard' || routePath === 'examiner/valuation-review') || 
      ((routePath === 'valuation' || routePath === 'examiner/review' || routePath==='examiner/reviewe/valuationreview') && userRole == 2))) {
  let UserRole = [];
      
      // Parse the User_Roll_Admin field - handle both JSON array and comma-separated string
      if (tokendb[flnameRollMaster]) {
        try {
          if (tokendb[flnameRollMaster].startsWith('[')) {
            // JSON array format
            UserRole = JSON.parse(tokendb[flnameRollMaster]);
          } else {
            // Comma-separated string format
            UserRole = tokendb[flnameRollMaster].split(',').map(role => role.trim());
          }
        } catch (e) {
          console.error(`Error parsing ${flnameRollMaster}:`, e);
          UserRole = [];
        }
      }
      
      // Convert to integers and filter out invalid values
      const UserRoleIds = UserRole
        .map(role => parseInt(role, 10))
        .filter(id => !isNaN(id) && id > 0);
      
      console.log('User Role IDs (integers):', UserRoleIds);
      
      if (UserRoleIds.length === 0) {
        return next(new AppError("No navigation permissions assigned for this role", 403));
      }

    const data = await NavData.findAll({
      where: { id: UserRoleIds ,
        route_path: `/${routePath}`

      },
    });

    console.log('Navigation Data:', data);
    if (data.length === 0) {
      return next(new AppError("No navigation data found for user role", 404));
    }
  }

      req.user = tokendb;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401);
      throw new AppError(`Not authorised, token failed: ${error.message}`);
    }
  } else {
    res.status(401);
    throw new AppError("Not authorised, no token");
  }
});

const admin = asyncHandler(async (req, res, next) => {
  console.log(req.session.userid);
  if (req.user && req.user.user_Type == 1) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorised as Admin");
  }
});

const candidateprotect = (req, res, next) => {
  if (req.user && req.user.user_Type == 3) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorised as Candidate");
  }
};

module.exports = { protect, admin, candidateprotect , modalprotect};
