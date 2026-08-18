const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const protect = async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string') {
    const cleanHeader = authHeader.trim();
    if (cleanHeader.startsWith('Bearer ')) {
      token = cleanHeader.substring(7);
    } else if (cleanHeader.startsWith('Bearer')) {
      token = cleanHeader.substring(6);
    } else {
      token = cleanHeader;
    }
  }

  if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
    return ApiResponse.error(res, 'Not authorized. Token missing', 401);
  }

  token = token.replace(/^["']|["']$/g, '').trim();

  try {
    const secret = (process.env.JWT_SECRET || 'super_secret_slms_jwt_key_2026_production_ready').trim();
    const decoded = jwt.verify(token, secret);
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return ApiResponse.error(res, 'The user belonging to this token no longer exists.', 401);
    }

    if (!currentUser.isActive) {
      return ApiResponse.error(res, 'User account is deactivated. Please contact librarian.', 403);
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired token', 401);
  }
};

module.exports = { protect };
